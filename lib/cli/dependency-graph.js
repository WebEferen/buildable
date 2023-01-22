import { fetchConfiguration } from '../modules/options.js';
import { findPackages, generateDependencyGraph, outputGraph } from '../modules/graph.js';

export const run = async (options) => {
    const { path, excluded } = fetchConfiguration(options);

    const { packages } = await findPackages(path);
    const { order, dependencies } = await generateDependencyGraph(packages, excluded);

    outputGraph(dependencies, order);
}

export default {
    name: 'dependency-graph',
    description: 'lists packages with their dependencies',
    builder: (_) => {},
    handler: (options) => run(options)
};
