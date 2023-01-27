import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

import { Logger } from "./logger.js";
import { CliOptions } from "./options.js";
import { readJsonFile } from "../utils/read-file.js";

export class Linker {
  #options;
  #logger;
  #links;

  constructor(options, logger) {
    this.#options = options ? options : new CliOptions();
    this.#logger = logger ? logger : new Logger(this.#options);

    this.#loadConfiguration();
  }

  // Do the npm link in linked package the directory
  link(pkg, toPkg) {
    const prefix = (msg, color) => this.#logger.format(msg, color);

    const name = pkg.packageJson.name;
    const toName = toPkg.packageJson.name;

    if (this.isLinked(pkg, toPkg)) {
      const message = prefix(`${name} ⇢ ${toName} (cache)`, "gray");
      this.#logger.log(message, prefix("‣", "green"));
      return;
    }

    if (!this.#links[toName]) this.#links[toName] = [];
    if (!this.#links[toName].includes(name)) {
      this.#links[toName].push(name);
    }

    const message = prefix(`${name} ⇢ ${toName}`, "gray");
    this.#logger.log(message, prefix("‣", "green"));

    const command = `cd ${toPkg.dir} && npm link ${pkg.dir}`;
    execSync(command).toString("utf-8");
  }

  // Do the npm unlink package in fromPackage directory
  unlink(pkg, fromPkg) {
    const prefix = (msg, color) => this.#logger.format(msg, color);

    const name = pkg.packageJson.name;
    const fromName = fromPkg.packageJson.name;

    if (!this.isLinked(pkg, fromPkg)) return;
    this.#links = this.#links[fromName].filter((link) => link !== name);

    const message = prefix(`${fromName} ✂︎ ${name}`, "gray");
    this.#logger.log(message, prefix(" ", "green"));

    const command = `cd ${fromPkg.dir} && npm unlink ${pkg.dir} --no-save`;
    execSync(command).toString("utf-8");
  }

  // Check package if it is linked in toPackage
  isLinked(pkg, toPkg) {
    const include = (dependency) => dependency.resolved.includes("file:");

    const name = pkg.packageJson.name;
    const command = `cd ${toPkg.dir} && npm ls --link --json`;
    const result = JSON.parse(execSync(command).toString("utf-8"));

    if (!result.dependencies) return false;

    const results = Object.entries(result.dependencies)
      .filter(([key, dependency]) => key === name && include(dependency))
      .map(([key, _]) => key);

    return results.length > 0;
  }

  // Save existing links into .buildable file
  saveConfiguration() {
    const path = this.#options.getConfigPath();
    const config = readJsonFile(path);
    config.links = this.#links;

    writeFileSync(path, JSON.stringify(config, null, 2));
  }

  // Load existing linkings (.buildable) into #linked property
  #loadConfiguration() {
    const { links } = this.#options.getOptions();
    this.#links = links;
  }
}
