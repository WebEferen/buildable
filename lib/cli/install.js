import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";
import { ProcessManager } from "../modules/process.js";
import { Finder } from "../modules/finder.js";

const run = async (parameters) => {
  const options = new CliOptions({ ...parameters, script: "npm install" });

  const finder = new Finder(options);
  const dependencyGraph = new DependencyGraph(options);
  const processManager = new ProcessManager(options);

  dependencyGraph.setPackages(await finder.findPackages());
  dependencyGraph.generate();
  dependencyGraph.linkPackages();

  const { dependencies, order } = dependencyGraph.getGraph();
  processManager.setExecutions(order, dependencies);
  processManager.spawn();
};

export default {
  name: "install",
  alias: "i",
  description: "installs packages for every project",
  builder: (yargs) => yargs.help(),
  handler: (options) => run(options),
};
