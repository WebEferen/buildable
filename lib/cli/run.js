import { fetchConfiguration } from '../modules/options.js';
import { findPackages, generateDependencyGraph } from '../modules/graph.js';
import { ProcessManager } from '../modules/process.js';

export const run = async (options) => {
    const { path, excluded } = fetchConfiguration(options);

    const { packages } = await findPackages(path);
    if (!packages) return;

    const { order, dependencies } = await generateDependencyGraph(packages, excluded);
    
    const processManager = new ProcessManager();
    processManager.setExecutions(options.script, order, dependencies);
    processManager.spawn();
}

export default {
    name: 'run [script]',
    description: 'runs script for every project',
    builder: (yargs) => yargs.positional('script', {}),
    handler: (options) => run(options)
};