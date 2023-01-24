import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";
import { ProcessManager } from "../modules/process.js";

const run = async (parameters) => {
  const options = new CliOptions(parameters);
  const dependencyGraph = new DependencyGraph(options);
  const processManager = new ProcessManager(options);

  await dependencyGraph.findPackages();
  await dependencyGraph.generate();

  const { dependencies, order } = dependencyGraph.getGraph();
  processManager.setExecutions(order, dependencies);
  processManager.spawn();
};

export default {
  name: "run <script>",
  alias: "r",
  description: "runs script for every project",
  builder: (yargs) =>
    yargs
      .positional("script", {})
      .option("listeners", {
        alias: "l",
        description: "Custom listeners array",
        type: "array",
      })
      .option("only", {
        alias: "o",
        description: "Runs script in only one package (with dependencies)",
        type: "array",
      })
      .help(),
  handler: (options) => run(options),
};
