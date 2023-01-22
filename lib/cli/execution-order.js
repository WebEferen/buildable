import { CliOptions } from '../modules/options.js';
import { DependencyGraph } from '../modules/graph.js';

export const run = async (options) => {
    const configuration = new CliOptions(options);
    const path = configuration.getPath();
    const excluded = configuration.getExcluded();

    const dependencyGraph = new DependencyGraph(path);
    await dependencyGraph.findPackages();

    await dependencyGraph.generate(excluded);
    return dependencyGraph.printOrder();
}

export default {
    name: 'execution-order',
    alias: 'eo',
    description: 'prints out execution order',
    builder: (_) => {},
    handler: (options) => run(options)
};
