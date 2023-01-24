import { CliOptions } from '../modules/options.js';
import { DependencyGraph } from '../modules/graph.js';

export const run = async (parameters) => {
    const options = new CliOptions(parameters);
    const dependencyGraph = new DependencyGraph(options);

    await dependencyGraph.findPackages();
    await dependencyGraph.generate();

    return dependencyGraph.printOrder();
}

export default {
    name: 'execution-order',
    alias: 'eo',
    description: 'prints out execution order',
    builder: (_) => {},
    handler: (options) => run(options)
};
