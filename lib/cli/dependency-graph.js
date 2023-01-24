import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";

const run = async (parameters) => {
  const options = new CliOptions(parameters);
  const dependencyGraph = new DependencyGraph(options);

  await dependencyGraph.findPackages();
  await dependencyGraph.generate();

  return dependencyGraph.printGraph();
};

export default {
  name: "dependency-graph",
  alias: "dg",
  description: "lists packages graph",
  builder: (_) => {},
  handler: (options) => run(options),
};
