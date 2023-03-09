import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";
import { ProcessManager } from "../modules/process.js";

const run = async (parameters) => {
  const script = `pnpm install`;
  const options = new CliOptions({ ...parameters, script });

  const dependencyGraph = new DependencyGraph(options);
  const processManager = new ProcessManager(options);

  const { dependencies, order } = await dependencyGraph.generate();

  processManager.setExecutions(order, dependencies);
  return processManager.spawn();
};

export default {
  name: "install",
  alias: "i",
  description: "installs packages for every project",
  builder: (yargs) => yargs.help(),
  handler: (options) => run(options),
};
