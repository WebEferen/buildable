import { CliOptions } from "../modules/options.js";
import { DependencyGraph } from "../modules/graph.js";
import { ProcessManager } from "../modules/process.js";

const run = async (parameters) => {
  const options = new CliOptions({ ...parameters, script: "pnpm install" });
  const { workspace } = options.getOptions();

  const dependencyGraph = new DependencyGraph(options);
  const processManager = new ProcessManager(options);

  const { dependencies, order } = await dependencyGraph.generate();
  if (workspace) await dependencyGraph.initializeWorkspace();

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
