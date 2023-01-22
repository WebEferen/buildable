import { resolve } from 'node:path';

export class CliOptions {
    #options;

    constructor(options = {}) {
        this.#options = options;
    }

    getPath(cwd = process.cwd()) {
        return resolve(cwd, this.#options.path ? this.#options.path : 'packages');
    }

    getExcluded() {
        const excluded = [];

        if (Array.isArray(this.#options.exclude)) {
            excluded.push(...this.#options.exclude)
        };

        return excluded;
    }

    getDefaults() {
        // TODO: Implement configuration loader
        return {};
    }
}

// TODO: Add config loading mechanism
// const newConfig = resolve(dirname(fileURLToPath(import.meta.url)), '../.buildable');

// if (config) {
//     const configPath = resolve(process.cwd(), config);
//     const configuration = JSON.parse(readFileSync(configPath, { encoding: 'utf-8' }));
//     if (!configuration) return console.error(chalk.red('No configuration found!'));
//     excludedPackages.push(...(configuration.excludedPackages || []));
// }
