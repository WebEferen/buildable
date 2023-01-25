import { BehaviorSubject } from "rxjs";

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

  constructor(options, readiness, logger) {
    this.#options = options ? options : new CliOptions();
    this.#readiness = readiness ? readiness : new Readiness(this.#options);
    this.#logger = logger ? logger : new Logger(this.#options);
    this.#listener = new Listener(this.#logger);
    this.#parser = new Parser(this.#options);
  }

  setExecutions(queue = [], dependencies = []) {
    const only = this.#options.getOnly();
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
    const { executable, options } = this.#options.getRunner();
    const { commands, result } = executable(scripts, options);

    const comms = this.#parser.parseCommands(commands);
    comms.forEach((command) => this.#process(command));

    return result;
  }

  spawn() {
    this.#queue.next(this.#executions.shift());
    this.#queue.subscribe(async (execution) => {
      this.#execute([execution]).catch((error) => {
        const message = `Shutting down script due to an error.\n`;
        this.#logger.error(message, `[${execution.name}]`);

        const format = this.#logger.format(error, "gray");
        const prefix = this.#logger.format(`[${execution.name}]`, "red");
        this.#logger.log(format, prefix);

        process.exit(0);
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
  }

  #isServiceReady(output) {
    const reload = this.#options.getReload();
    const isMatch = this.#readiness.check(output);

    if (isMatch && this.#executions.length === 0) {
      const processes = Object.entries(this.#processes);
      const reloadable = processes.filter(([name]) => reload.includes(name));

      this.#logger.printReadiness(reloadable);
      this.#logger.listenForKeyPress((key) => {
        if (key.name === "q") return process.exit(0);

        reloadable.forEach(([name], idx) => {
          if (key && key.name === (idx + 1).toString())
            this.#restartService(name);
        });
      });
    }

    return isMatch && this.#executions.length > 0;
  }

  #restartService(service) {
    this.#processes[service].kill();
    this.#queue.next(this.#initial[service]);
  }
}
