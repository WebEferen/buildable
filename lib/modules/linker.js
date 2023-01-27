import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

import { Logger } from "./logger.js";
import { CliOptions } from "./options.js";
import { readJsonFile } from "../utils/read-file.js";

export class Linker {
  #links = {};
  #options;
  #logger;

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

    if (this.#links[name]) {
      const filtered = this.#links[name].filter((link) => link !== fromName);
      filtered.length > 0
        ? (this.#links[name] = filtered)
        : delete this.#links[name];
    }

    const message = prefix(`${fromName} ✂︎ ${name}`, "gray");
    this.#logger.log(message, prefix("‣", "green"));

    const command = `cd ${pkg.dir} && npm unlink ${fromName} --no-save`;
    execSync(command).toString("utf-8");
  }

  // Unlink all packages on install to get fresh install
  unlinkAll(packages = []) {
    const findPackage = (name) =>
      packages.find(({ packageJson }) => packageJson.name === name);

    packages.forEach((pkg) => {
      const linked = this.#getLinkedPackages(pkg);

      linked.forEach(([name]) => {
        const peerPackage = findPackage(name);
        this.unlink(pkg, peerPackage);
      });
    });

    this.saveConfiguration();
  }

  #getLinkedPackages(pkg) {
    const include = (dependency) => dependency.resolved.includes("file:");

    const command = `cd ${pkg.dir} && npm ls --link --json`;
    const result = JSON.parse(execSync(command).toString("utf-8"));
    if (!result.dependencies) return [];

    const results = Object.entries(result.dependencies).filter(
      ([_, dependency]) => include(dependency)
    );

    return results;
  }

  // Check package if it is linked in toPackage
  isLinked(pkg, toPkg) {
    const name = pkg.packageJson.name;
    const linked = this.#getLinkedPackages(toPkg);
    const results = linked.filter(([key]) => key === name);

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
