import { resolve } from 'node:path';

export const fetchConfiguration = ({ path, exclude, config }) => {
    const packages = exclude || [];
    const directory = resolve(process.cwd(), path ?? 'packages');

    // TODO: Add config loading mechanism
    // const newConfig = resolve(dirname(fileURLToPath(import.meta.url)), '../.buildable');

    // if (config) {
    //     const configPath = resolve(process.cwd(), config);
    //     const configuration = JSON.parse(readFileSync(configPath, { encoding: 'utf-8' }));
    //     if (!configuration) return console.error(chalk.red('No configuration found!'));

    //     excludedPackages.push(...(configuration.excludedPackages || []));
    // }

    return { path: directory, excluded: packages };
}
