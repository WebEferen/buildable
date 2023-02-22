import { emitKeypressEvents } from "node:readline";
import chalk from "chalk";

import { CliOptions } from "./options.js";

export class Logger {
  #options;

  #logger = console.log;
  #verboseLogger = console.debug;
  #errorLogger = console.error;

  constructor(options) {
    this.#options = options ?? new CliOptions();

    const { customLoggers } = this.#options.getOptions();
    const { log, verbose, error } = customLoggers || {};

    if (typeof log === "function") this.#logger = log;
    if (typeof verbose === "function") this.#verboseLogger = verbose;
    if (typeof error === "function") this.#errorLogger = error;
  }

  log(message, prefix = "") {
    const formatted = prefix.length > 0 ? `${prefix} ` : "";
    return this.#logger(`${formatted}${message}`);
  }

  verbose(message, prefix = "") {
    const { verbose } = this.#options.getOptions();
    if (!verbose) return;

    const formatted = prefix.length > 0 ? `${prefix} ` : "";
    const title = chalk.yellow("[Verbose]");

    return this.#verboseLogger(`${title} ${formatted}${message}`);
  }

  error(message, prefix = "", color = "red") {
    const formatted = prefix.length > 0 ? `${prefix} ` : "";
    return this.#errorLogger(chalk[color](`${formatted}${message}`));
  }

  format(message, color) {
    const output = color ? chalk[color] : chalk;
    return output(message);
  }

  printPackages(count = 0) {
    const prefix = this.format("✔︎", "green");
    const message = `Found ${count} item(s) in queue...\n`;
    this.log(message, prefix);
  }

  printReadiness(processes = []) {
    const message = `💚 All of the services are up and running!\n   May the linking be with you!`;
    const prefix = (text) => this.format(`   ${text}`, "green");
    const gray = (text) => this.format(text, "gray");

    const headline = this.format(message, "bold");
    const composite = this.format(headline, "green");

    this.log(`\n\n${composite}\n\n`);
    this.log("Use keyboard shortcuts to perform actions", "🔧");
    this.log(`‣ ${gray("Kill the application")}`, prefix("q"));

    if (processes.length > 0) this.log("Application specific", "\n🚩");

    processes.forEach(([name], idx) =>
      this.log(`‣ ${gray(`Restart ${name}`)}`, prefix(idx + 1).toString())
    );

    this.log("\n");
  }

  listenForKeyPress(cb = (key) => {}) {
    emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    process.stdin.on("keypress", (_, key) => {
      if (key) cb(key);
    });
  }
}
