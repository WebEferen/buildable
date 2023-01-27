import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";
import { Finder } from "../modules/finder.js";

const run = async (parameters) => {
  const options = new CliOptions(parameters);

  const finder = new Finder(options);
  const dependencyGraph = new DependencyGraph(options);

  dependencyGraph.setPackages(await finder.findPackages());
  dependencyGraph.generate();

  return dependencyGraph.printGraph();
};

export default {
  name: "dependency-graph",
  alias: "dg",
  description: "lists packages graph",
  builder: (_) => {},
  handler: (options) => run(options),
};
