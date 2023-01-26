import { concurrently } from "concurrently";
import { resolve } from "node:path";

import { readJsonFile } from "../utils/read-file.js";

export class CliOptions {
  #options = {
    only: [],
    exclude: [],
    listeners: [],
    reload: [],
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

  getOptions() {
    return this.#options;
  }

  #loadFromCli(options = {}) {
    this.#addArrayOption("only", options.only);
    this.#addArrayOption("exclude", options.exclude);
    this.#addArrayOption("listeners", options.listeners);
    this.#addArrayOption("reload", options.reload);

    this.#addOption("customLoggers", options.customLoggers, true);
    this.#addOption("verbose", options.verbose, true);
    this.#addOption("workspace", options.workspace, true);
    this.#addOption("script", options.script);
    this.#addOption("path", options.path);

    this.#loadRunner(options);
  }

  #addArrayOption(name, value) {
    if (typeof value === 'undefined') return;
    this.#options[name].push(...String(value || "").split(","));
  }

  #addOption(name, value, raw = false) {
    if (typeof value === 'undefined') return;
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

      if (userConfiguration[key] !== undefined) {
        Array.isArray(userConfiguration[key])
          ? this.#options[key].push(...userConfiguration[key])
          : (this.#options[key] = userConfiguration[key]);
      }
    });
  }
}
