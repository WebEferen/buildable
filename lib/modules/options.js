import { concurrently } from "concurrently";
import { resolve } from "node:path";

import { Logger } from "./logger.js";
import { readFile, saveFile } from "../utils/read-file.js";

const CONFIGURATION_FILE = ".buildable";

export class CliOptions {
  #logger;
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
  };

  constructor(options) {
    this.#loadConfiguration(options);
    this.#loadFromCli(options);
    this.#logger = new Logger(this);
  }

  getOptions() {
    return this.#options;
  }

  getPath(cwd = process.cwd()) {
    return resolve(cwd, this.#options.path);
  }

  initializeConfig() {
    const gray = (message) => this.#logger.format(message, "gray");
    const white = (message) => this.#logger.format(message, "white");
    const path = this.#options.config ?? CONFIGURATION_FILE;
    if (Object.keys(readFile(path, process.cwd())).length > 0) return;

    this.#logger.log(white(`Initializing workspace configuration...`), `🔧`);
    const message = gray(`   Saved configuration into:`);

    const entries = Object.entries(this.#options)
      .filter(([key, _]) => key !== "customLoggers" && key !== "runner")
      .filter(([_, value]) => value);

    const object = Object.fromEntries(entries);
    saveFile(path, Object.assign({}, object));

    this.#logger.log(white(CONFIGURATION_FILE), message);
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
    const baseConfiguration = readFile(CONFIGURATION_FILE);
    const userConfiguration = readFile(
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
