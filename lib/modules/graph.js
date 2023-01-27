import { DepGraph } from "dependency-graph";
import { getPackages } from "@manypkg/get-packages";

import { CliOptions } from "./options.js";
import { Logger } from "./logger.js";
import { Linker } from "./linker.js";

export class DependencyGraph {
  #options;
  #logger;
  #linker;

  #packages = [];
  #order = [];
  #dependencies = {};

  constructor(options, logger, linker) {
    this.#options = options ? options : new CliOptions();
    this.#logger = logger ? logger : new Logger(this.#options);
    this.#linker = linker ? linker : new Linker(this.#options, this.#logger);
  }

  setPackages(packages) {
    this.#packages = packages;
  }

  getGraph() {
    return {
      order: this.#order,
      dependencies: this.#dependencies,
      packages: this.#packages,
    };
  }

  linkPackages() {
    const { workspace } = this.#options.getOptions();
    if (workspace) return;

    const green = (msg) => this.#logger.format(msg, "green");
    const findByName = (name) =>
      this.#packages.find(({ packageJson }) => packageJson.name === name);

    this.#logger.log("Linking packages...\n", green("\n❍"));

    Object.entries(this.#dependencies).forEach(([name, dependencies]) => {
      if (dependencies.length === 0) return;
      const rootPackage = findByName(name);

      dependencies.forEach((dependency) => {
        const peerPackage = findByName(dependency);
        this.#linker.link(peerPackage, rootPackage);
      });
    });

    this.#logger.log("");
    // this.#linker.unlink(PACKAGE_A, PACKAGE_B);
    // this.#linker.isLinked(PACKAGE_A, PACKAGE_B);

    this.#linker.saveConfiguration();
  }

  generate() {
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
