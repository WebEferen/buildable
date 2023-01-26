import { DepGraph } from "dependency-graph";
import { getPackages } from "@manypkg/get-packages";

import { CliOptions } from "./options.js";
import { Logger } from "./logger.js";

export class DependencyGraph {
  #options;
  #logger;

  #packages = [];
  #order = [];
  #dependencies = {};

  constructor(options, logger) {
    this.#options = options ? options : new CliOptions();
    this.#logger = logger ? logger : new Logger(options);
  }

  async findPackages() {
    const path = this.#options.getPath();
    const { packages } = await getPackages(path).catch(() => {
      this.#logger.error("Could not find any package", "❌", "red");

      return { packages: [] };
    });

    this.#packages = packages;
  }

  getGraph() {
    return {
      order: this.#order,
      dependencies: this.#dependencies,
      packages: this.#packages,
    };
  }

  async generate() {
    const { exclude } = this.#options.getOptions();
    const names = this.#packages.map(({ packageJson }) => packageJson.name);
    const generatedDependencies = {};
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

        generatedDependencies[name] = graph
          .dependenciesOf(name)
          .filter((pkg) => {
            return names.includes(pkg);
          });
      });

    this.#order = this.#parseOrder(graph.overallOrder());
    this.#dependencies = generatedDependencies;
  }

  printOrder() {
    this.#order.forEach((pkg) =>
      this.#logger.log(this.#logger.format(pkg.name, "green"), "‣")
    );
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
        (pkg) => pkg.packageJson.name === item
      );
      const { name, scripts, version } = packageJson || {};

      return { name, scripts, version, directory: dir };
    });
  }
}
