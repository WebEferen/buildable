import { CliOptions } from "./options.js";
import { Logger } from "./logger.js";

export class Parser {
  #options;
  #logger;

  constructor(options, logger) {
    this.#options = options ? options : new CliOptions();
    this.#logger = logger ? logger : new Logger(this.#options);
  }

  parseExecutions(
    executions = [],
    dependencies = [],
    callback = (execution) => {}
  ) {
    const command = this.#options.getScript();
    const customCommands = this.#options.getCustomCommands();

    executions.forEach((entrypoint) => {
      let clonedCommand = command;
      const prefix = this.#logger.format("❍", "green");
      const execution = `${entrypoint.name} @ v${entrypoint.version}`;
      const message = this.#logger.format(execution, "gray");
      this.#logger.log(message, prefix);

      if (customCommands[command] && customCommands[command][entrypoint.name]) {
        clonedCommand = customCommands[command][entrypoint.name];
      }

      callback({
        name: entrypoint.name,
        command: clonedCommand,
        cwd: entrypoint.directory,
        dependsOn: dependencies[entrypoint.name],
      });
    });

    this.#logger.log("");
  }

  parseOnly(executions, only = [], dependencies = []) {
    only.forEach((entry) => {
      (dependencies[entry] || []).forEach((dependency) => {
        only.push(dependency);
      });
    });

    return executions.filter((entrypoint) => only.includes(entrypoint.name));
  }

  parseCommands(commands = []) {
    return commands.map((command) => ({
      script: command.command,
      name: command.name,
      color: command.prefixColor || "green",
      pid: command.pid,
      cwd: command.cwd,
      close: command.close,
      kill: command.kill,
      listener: command.stdout,
      crash: command.stderr,
      restart: false,
    }));
  }
}
