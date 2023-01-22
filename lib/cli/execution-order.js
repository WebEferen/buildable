import { fetchConfiguration } from '../modules/options.js';
import { findPackages, generateDependencyGraph, outputExecutionOrder } from '../modules/graph.js';

export const run = async (options) => {
    const { path, excluded } = fetchConfiguration(options);

    const { packages } = await findPackages(path);
    const { order } = await generateDependencyGraph(packages, excluded);

    outputExecutionOrder(order);
}

export default {
    name: 'execution-order',
    description: 'prints out execution order',
    builder: (_) => {},
    handler: (options) => run(options)
};
