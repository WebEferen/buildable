import { concurrently } from "concurrently";
import { resolve } from "node:path";

import { readJsonFile } from "../utils/read-file.js";
import { writeFileSync } from "node:fs";

const CONFIGURATION_FILE = ".buildable";

export class CliOptions {
  #options = {
    only: [],
    exclude: [],
    listeners: [],
    reload: [],
    path: "packages",
    packagesPattern: "*/package.json",
    config: null,
    script: null,
    verbose: false,
    workspace: true,
    runner: null,
    customLoggers: {
      log: null,
      verbose: null,
      error: null,
    },
    customCommands: {},
    links: {},
  };

  constructor(options) {
    this.#loadConfiguration(options);
    this.#loadFromCli(options);
  }

  getOptions() {
    return this.#options;
  }

  getPath(cwd = process.cwd()) {
    return resolve(cwd, this.#options.path);
  }

  getConfigPath() {
    const path = this.#options.config ?? CONFIGURATION_FILE;
    return resolve(process.cwd(), path);
  }

  saveToFile(data) {
    this.#options = Object.assign(this.#options, data);
    const options = JSON.stringify(this.#options, null, 2);

    writeFileSync(this.getConfigPath(), options);
  }

  #loadFromCli(options = {}) {
    this.#addArrayOption("only", options.only);
    this.#addArrayOption("exclude", options.exclude);
    this.#addArrayOption("listeners", options.listeners);
    this.#addArrayOption("reload", options.reload);

    this.#addOption("packagesPattern", options.packagesPattern);
    this.#addOption("customLoggers", options.customLoggers, true);
    this.#addOption("verbose", options.verbose, true);
    this.#addOption("workspace", options.workspace, true);
    this.#addOption("script", options.script);
    this.#addOption("config", options.config);
    this.#addOption("path", options.path);

    this.#loadRunner(options);
  }

  #addArrayOption(name, value) {
    if (typeof value === "undefined") return;

    this.#options[name].push(...String(value || "").split(","));
  }

  #addOption(name, value, raw = false) {
    if (typeof value === "undefined") return;

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
    const baseConfiguration = readJsonFile(CONFIGURATION_FILE);
    const userConfiguration = readJsonFile(
      options.config ?? CONFIGURATION_FILE,
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
