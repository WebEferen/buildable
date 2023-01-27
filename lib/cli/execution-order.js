import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";
import { Finder } from "../modules/finder.js";

const run = async (parameters) => {
  const options = new CliOptions(parameters);

  const finder = new Finder(options);
  const dependencyGraph = new DependencyGraph(options);

  dependencyGraph.setPackages(await finder.findPackages());
  dependencyGraph.generate();

  return dependencyGraph.printOrder();
};

export default {
  name: "execution-order",
  alias: "eo",
  description: "prints out execution order",
  builder: (_) => {},
  handler: (options) => run(options),
};
