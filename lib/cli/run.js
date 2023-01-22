import { CliOptions } from '../modules/options.js';
import { DependencyGraph } from '../modules/graph.js';
import { ProcessManager } from '../modules/process.js';

export const run = async (options) => {
    const configuration = new CliOptions(options);
    const path = configuration.getPath();
    const excluded = configuration.getExcluded();

    const dependencyGraph = new DependencyGraph(path);
    await dependencyGraph.findPackages();

    await dependencyGraph.generate(excluded);
    const { dependencies, order } = dependencyGraph.getGraph();
    
    const processManager = new ProcessManager();
    processManager.setExecutions(options.script, order, dependencies);
    processManager.spawn();
}

export default {
    name: 'run <script>',
    alias: 'r',
    description: 'runs script for every project',
    builder: (yargs) => yargs.positional('script', {}),
    handler: (options) => run(options)
};
