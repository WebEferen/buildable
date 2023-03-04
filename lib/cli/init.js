import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";

const run = async (parameters) => {
  const options = new CliOptions({ ...parameters });
  const { workspace } = options.getOptions();
  options.initializeConfig();

  const dependencyGraph = new DependencyGraph(options);
  if (workspace) dependencyGraph.initializeWorkspace();
};

export default {
  name: "init",
  description: "initialize buildable configuration",
  builder: (yargs) => yargs.help(),
  handler: (options) => run(options),
};
