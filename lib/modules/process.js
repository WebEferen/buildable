import { BehaviorSubject } from "rxjs";

import { Readiness } from "./readiness.js";
import { CliOptions } from "./options.js";
import { Logger } from "./logger.js";

export class ProcessManager {
  #queue = new BehaviorSubject();
  #readiness;
  #options;
  #logger;

  #listeners = {};
  #crashes = {};
  #closes = {};

  #processes = {};
  #executions = [];

  constructor(options, readiness, logger) {
    this.#options = options ? options : new CliOptions();
    this.#readiness = readiness ? readiness : new Readiness(options);
    this.#logger = logger ? logger : new Logger(options);
  }

  setExecutions(queue = [], dependencies = []) {
    let executions = [...queue];
    let command = this.#options.getScript();

    const only = this.#options.getOnly();
    if (only.length > 0) executions = this.#parseOnly(only, dependencies);

    const prefix = this.#logger.format("✔︎", "green");
    this.#logger.log(`Found ${executions.length} item(s) in queue...`, prefix);

    this.#parseExecutions(executions, dependencies, command);
    this.#logger.log("\n");
  }

  #parseOnly(only = [], dependencies = []) {
    // If only has dependencies then don't remove them from executions list
    only.forEach((entry) => {
      (dependencies[entry] || []).forEach((dependency) => {
        only.push(dependency);
      });
    });

    return executions.filter((entrypoint) => only.includes(entrypoint.name));
  }

  #parseExecutions(executions = [], dependencies = [], command) {
    const customCommands = this.#options.getCustomCommands();

    executions.forEach((entrypoint) => {
      const prefix = this.#logger.format("❍", "green");
      const message = this.#logger.format(
        `${entrypoint.name} @ v${entrypoint.version}`,
        "gray"
      );
      this.#logger.log(message, prefix);

      if (customCommands[command] && customCommands[command][entrypoint.name]) {
        command = customCommands[command][entrypoint.name];
      }

      this.#executions.push({
        name: entrypoint.name,
        command: command,
        cwd: entrypoint.directory,
        dependsOn: dependencies[entrypoint.name],
      });
    });
  }

  async #execute(scripts = []) {
    const { executable, options } = this.#options.getRunner();
    const { commands, result } = executable(scripts, options);
    const processes = this.#getProcesses(commands);
    this.#parseProcesses(processes);

    return result;
  }

  spawn() {
    this.#queue.next(this.#executions.shift());

    this.#queue.subscribe(async (execution) => {
      await this.#execute([execution]).catch(() => {
        this.#logger.error(
          `Shutting down script due to an error.`,
          `[${execution.name}]`,
          "red"
        );

        Object.values(this.#processes).forEach((entry) => entry.kill());
        process.exit(0);
      });
    });
  }

  #getProcesses(commands = []) {
    return commands.map((command) => ({
      script: command.command,
      name: command.name,
      color: command.prefixColor || "green",
      pid: command.pid,
      cwd: command.cwd,
      kill: command.kill,
      close: command.close,
      start: command.start,
      listener: command.stdout,
      crash: command.stderr,
    }));
  }

  #parseProcesses(processes = []) {
    processes.forEach((processEntry) => {
      this.#processes[processEntry.name] = processEntry;
      this.#attachListener(processEntry);
      this.#attachCrashListener(processEntry);
      this.#attachCloseListener(processEntry);
    });
  }

  #isServiceReady(output) {
    const isMatch = this.#readiness.check(output);
    return isMatch && this.#executions.length > 0;
  }

  #attachCloseListener(entry) {
    this.#closes[entry.name] = entry.close.subscribe(() => {
      if (this.#executions.length > 0)
        return this.#queue.next(this.#executions.shift());
      return this.#queue.complete();
    });
  }

  #attachListener(entry) {
    this.#listeners[entry.name] = entry.listener.subscribe((buffer) => {
      const output = String(buffer.toString())
        .split("\n")
        .filter((line) => line !== "\x1Bc")
        .filter((line) => line)
        .map((line) => this.#formatMessage(entry, line))
        .join("\n");

      this.#logger.log(output);

      if (this.#isServiceReady(output)) {
        return this.#queue.next(this.#executions.shift());
      }
    });
  }

  #attachCrashListener(entry) {
    this.#crashes[entry.name] = entry.crash.subscribe((buffer) => {
      const output = String(buffer.toString())
        .split("\n")
        .filter((line) => line !== "\x1Bc")
        .filter((line) => line)
        .map((line) => this.#formatMessage(entry, line, "gray"))
        .join("\n");

      this.#logger.error(output);
    });
  }

  #formatMessage(entry, message = "", messageColor = undefined) {
    const name = this.#logger.format(`[${entry.name}]`, entry.color ?? "gray");
    const formatted = this.#logger.format(message, messageColor);

    return `${name} ${formatted}`;
  }
}
