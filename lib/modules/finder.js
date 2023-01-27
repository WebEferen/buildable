import glob from "glob";
import { getPackages } from "@manypkg/get-packages";

import { CliOptions } from "./options.js";
import { readJsonFile } from "../utils/read-file.js";

export class Finder {
  #options;

  constructor(options) {
    this.#options = options ?? new CliOptions();
  }

  async findPackages() {
    const { workspace } = this.#options.getOptions();

    return workspace
      ? await this.#findWorkspacePackages()
      : await this.#findNonWorkspacePackages();
  }

  async #findWorkspacePackages() {
    const root = this.#options.getPath();
    const { packages } = await getPackages(root).catch(() => {
      return { packages: [] };
    });

    return packages;
  }

  async #findNonWorkspacePackages() {
    const root = this.#options.getPath();
    const { path, packagesPattern } = this.#options.getOptions();
    const packages = glob.sync(`${root}/${packagesPattern}`);

    return packages
      .map((pkg) => pkg.split("/").slice(0, -1).join("/"))
      .filter((parts) => parts.includes(path))
      .map((directory) => ({
        dir: directory,
        packageJson: readJsonFile(`${directory}/package.json`),
      }));
  }
}
