import { concurrently } from "concurrently";
import { resolve } from "node:path";

import { Logger } from "./logger.js";
import { readFile, saveFile } from "../utils/file.js";

const CONFIGURATION_FILE = ".buildable";

const NPMRC_FILE = ".npmrc";
const NPM = "auto-install-peers=true\nlink-workspace-packages=deep";

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
    safe: true,
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
    if (readFile(path, process.cwd())) return;

    this.#logger.log(white(`Initializing workspace configuration...`), `🔧`);
    const configuration = gray(`   Saved configuration into:`);
    const npmrc = gray(`   Saved rules into:`);

    const entries = Object.entries(this.#options)
      .filter(([key, _]) => key !== "customLoggers" && key !== "runner")
      .filter(([_, value]) => value);

    const object = Object.fromEntries(entries);
    saveFile(path, Object.assign({}, object));
    saveFile(NPMRC_FILE, NPM, "plain");

    this.#logger.log(white(CONFIGURATION_FILE), configuration);
    this.#logger.log(white(NPMRC_FILE), npmrc);
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
    this.#addOption("safe", options.safe, true);
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
    const path = options.config ?? CONFIGURATION_FILE;
    const baseConfiguration = readFile(CONFIGURATION_FILE) ?? {};
    const userConfiguration = readFile(path, process.cwd()) ?? {};

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
