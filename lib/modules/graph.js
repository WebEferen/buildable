import { DepGraph } from "dependency-graph";

import { CliOptions } from "./options.js";
import { Logger } from "./logger.js";
import { Finder } from "./finder.js";
import { readFile, saveFile } from "../utils/file.js";

export class DependencyGraph {
  #options;
  #logger;
  #finder;

  #packages = [];
  #order = [];
  #dependencies = {};

  constructor(options) {
    this.#options = options ? options : new CliOptions();
    this.#logger = new Logger(this.#options);
    this.#finder = new Finder(this.#options);
  }

  async generate() {
    this.#packages = await this.#finder.findPackages();

    const { exclude } = this.#options.getOptions();
    const names = this.#packages.map(({ packageJson }) => packageJson.name);
    const graph = new DepGraph({ circular: true });

    this.#packages
      .filter(({ packageJson }) => !exclude.includes(packageJson.name))
      .forEach(({ packageJson }) => {
        const { name } = packageJson;
        graph.addNode(name, packageJson);

        const dependencies = packageJson.dependencies || {};
        const peerDependencies = packageJson.peerDependencies || {};
        const devDependencies = packageJson.devDependencies || {};

        [dependencies, devDependencies, peerDependencies].forEach((entry) => {
          return Object.entries(entry).forEach(([dependency]) => {
            if (names.includes(dependency)) {
              graph.addNode(dependency);
              graph.addDependency(name, dependency);
            }
          });
        });

        this.#dependencies[name] = graph.dependenciesOf(name).filter((pkg) => {
          return names.includes(pkg);
        });
      });

    this.#order = this.#parseOrder(graph.overallOrder());

    return {
      order: this.#order,
      dependencies: this.#dependencies,
      packages: this.#packages,
    };
  }

  async initializeWorkspace() {
    const { path } = this.#options.getOptions();
    const workspaceFile = `pnpm-workspace.yaml`;
    const extension = `yaml`;

    const workspaces = readFile(workspaceFile, process.cwd(), extension) ?? {};

    if (!workspaces.packages) {
      this.#logger.log("Initializing workspace file...", "🔧");
      workspaces.packages = [`${path}/*`];
    }

    const file = `${process.cwd()}/${workspaceFile}`;
    return saveFile(file, workspaces, extension);
  }

  printOrder() {
    this.#order.forEach((pkg) => {
      const message = this.#logger.format(pkg.name, "green");
      this.#logger.log(message, "‣");
    });
  }

  printGraph() {
    const entries = Object.entries(this.#dependencies);

    entries.forEach(([name, dependencies]) => {
      const pkg = this.#order.find((entry) => entry.name === name);
      const formattedName = this.#logger.format(name, "green");
      const formattedVersion = pkg
        ? this.#logger.format(`@ v${pkg.version}`, "gray")
        : "";
      this.#logger.log(`${formattedName} ${formattedVersion}`, "‣");

      dependencies.forEach((dependency) =>
        this.#logger.log(this.#logger.format(dependency, "gray"), "   ")
      );
    });
  }

  #parseOrder(order = []) {
    return order.map((item) => {
      const { packageJson, dir } = this.#packages.find(
        ({ packageJson }) => packageJson.name === item
      );

      return {
        name: packageJson.name,
        scripts: packageJson.scripts,
        version: packageJson.version,
        directory: dir,
      };
    });
  }
}
