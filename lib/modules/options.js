import { concurrently } from "concurrently";
import { resolve } from "node:path";

import { readJsonFile } from "../utils/read-file.js";

export class CliOptions {
  #options = {
    only: [],
    exclude: [],
    listeners: [],
    path: null,
    script: null,
    verbose: false,
    runner: {
      options: {},
      executable: null,
    },
    customLoggers: {
      log: null,
      verbose: null,
      error: null,
    },
    customCommands: {},
  };

  constructor(options) {
    this.#loadConfiguration(options);
    this.#loadFromCli(options);
  }

  getPath(cwd = process.cwd()) {
    return resolve(cwd, this.#options.path ? this.#options.path : "packages");
  }

  getExcluded() {
    return this.#options.exclude;
  }

  getScript() {
    return this.#options.script;
  }

  getListeners() {
    return this.#options.listeners;
  }

  getVerbose() {
    return this.#options.verbose;
  }

  getRunner() {
    return this.#options.runner;
  }

  getOnly() {
    return this.#options.only;
  }

  getCustomLoggers() {
    return this.#options.customLoggers;
  }

  getCustomCommands() {
    return this.#options.customCommands;
  }

  #loadFromCli(options = {}) {
    this.#addArrayOption("only", options.only);
    this.#addArrayOption("exclude", options.exclude);
    this.#addArrayOption("listeners", options.listeners);

    this.#addOption("customLoggers", options.customLoggers, true);
    this.#addOption("verbose", Boolean(options.verbose), true);
    this.#addOption("script", options.script);
    this.#addOption("path", options.path);

    this.#loadRunner(options);
  }

  #addArrayOption(name, value) {
    if (!value) return;
    this.#options[name].push(...String(value || "").split(","));
  }

  #addOption(name, value, raw = false) {
    if (!value) return;
    this.#options[name] = raw ? value : String(value);
  }

  #loadRunner(options) {
    if (!options.runner)
      options.runner = {
        options: { outputStream: { write: () => {} }, successCondition: "all" },
        executable: concurrently,
      };

    if (typeof options.runner.executable === "function") {
      this.#options.runner = options.runner;
    }
  }

  #loadConfiguration(options = {}) {
    const baseConfiguration = readJsonFile(".buildable");
    const userConfiguration = readJsonFile(
      options.config ? options.config : ".buildable",
      process.cwd()
    );

    Object.keys(this.#options).forEach((key) => {
      if (baseConfiguration[key]) this.#options[key] = baseConfiguration[key];

      if (userConfiguration[key]) {
        Array.isArray(userConfiguration[key])
          ? this.#options[key].push(...userConfiguration[key])
          : (this.#options[key] = userConfiguration[key]);
      }
    });
  }
}
