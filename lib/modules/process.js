import { BehaviorSubject } from "rxjs";
import { kill } from "process";

import { Readiness } from "./readiness.js";
import { CliOptions } from "./options.js";
import { Logger } from "./logger.js";
import { Listener } from "./listener.js";
import { Parser } from "./parser.js";

export class ProcessManager {
  #queue = new BehaviorSubject();
  #readiness;
  #listener;
  #options;
  #logger;
  #parser;

  #processes = {};
  #executions = [];
  #initial = {};

  constructor(options) {
    this.#options = options ?? new CliOptions();
    this.#readiness = new Readiness(this.#options);
    this.#logger = new Logger(this.#options);
    this.#listener = new Listener(this.#logger);
    this.#parser = new Parser(this.#options);
  }

  setExecutions(queue = [], dependencies = []) {
    const { only } = this.#options.getOptions();
    const executions = this.#parser.parseOnly([...queue], only, dependencies);
    this.#logger.printPackages(executions.length);

    this.#parser
      .parseExecutions(executions, dependencies)
      .forEach((execution) => {
        this.#initial[execution.name] = execution;
        this.#executions.push(execution);
      });

    this.#logger.log("");
  }

  async #execute(scripts = []) {
    const { runner } = this.#options.getOptions();
    const { executable, options } = runner;

    const { commands, result } = executable(scripts, options);

    this.#parser
      .parseCommands(commands)
      .forEach((command) => this.#process(command));

    return result;
  }

  spawn() {
    this.#queue.next(this.#executions.shift());
    this.#queue.subscribe(async (execution) => {
      if (!execution) return;

      this.#execute([execution]).catch((error) => {
        if (Array.isArray(error)) {
          const first = error.shift();
          const command = this.#initial[first.command.name];

          if (command && command.restart) {
            this.#initial[command.name].restart = false;
            return;
          }
        }

        const message = `Shutting down script due to an error.\n`;
        this.#logger.error(message, `[${execution.name}]`);

        process.exit(1);
      });
    });
  }

  #process(command) {
    this.#processes[command.name] = command;
    this.#listener.attachCrashListener(command, (output) => {
      this.#logger.error(output);
    });

    this.#listener.attachInfoListener(command, (output) => {
      this.#logger.log(output);

      if (this.#isServiceReady(output, this.#executions)) {
        return this.#queue.next(this.#executions.shift());
      }
    });

    this.#processes[command.name].process.on("exit", (code) => {
      switch (code) {
        case null:
          return this.#queue.next(this.#initial[command.name]);
        case 0:
          return this.#executions.length > 0
            ? this.#queue.next(this.#executions.shift())
            : null;
        default:
          return this.#queue.next({ name: command.name });
      }
    });
  }

  #isServiceReady(output) {
    const { reload } = this.#options.getOptions();
    const isMatch = this.#readiness.check(output);

    if (isMatch && this.#executions.length === 0) {
      const processes = Object.entries(this.#processes);
      const reloadable = processes.filter(([name]) => reload.includes(name));

      this.#logger.printReadiness(reloadable);
      this.#logger.listenForKeyPress((key) => {
        if (key.name === "q") return this.#killServices();

        reloadable.forEach(([name], idx) => {
          if (key && key.name === (idx + 1).toString())
            this.#restartService(name);
        });
      });
    }

    return isMatch && this.#executions.length > 0;
  }

  #killServices() {
    Object.keys(this.#processes).forEach((service) => {
      if (!this.#processes[service].process) return;

      const prefix = this.#logger.format(`[${service}]`, "green");

      try {
        kill(this.#processes[service].process.pid);
        this.#logger.log(`Stopping service...`, prefix);
      } catch (e) {
        this.#logger.log(`Process already stopped`, prefix);
      }
    });

    process.exit(0);
  }

  #restartService(service) {
    kill(this.#processes[service].process.pid);
    this.#initial[service].restart = true;
  }
}
