import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

export class CliOptions {
    #options = {
        listeners: [],
        exclude: [],
        path: null,
        script: null,
        verbose: false,
    };

    constructor(options = {}) {
        if (options.config) this.#loadConfiguration(options.config);
        this.#loadFromCli(options);
    }

    getPath(cwd = process.cwd()) {
        return resolve(cwd, this.#options.path ? this.#options.path : 'packages');
    }

    getExcluded() {
        return this.#options.exclude;
    }

    getScript() {
        return this.#options.script;
    }

    getListeners() {
       return this.#options.listeners;
    }

    getVerbose() {
        return this.#options.verbose;
    }

    #loadFromCli(options) {
        if (options.exclude) this.#options.exclude.push(...String(options.exclude || '').split(','));
        if (options.listeners) this.#options.listeners.push(...String(options.listeners || '').split(','));
        if (options.script) this.#options.script = String(options.script);
        if (options.path) this.#options.path = String(options.path);
    }

    #loadConfiguration(path = '.buildable') {
        let config = resolve(process.cwd(), path);

        if (!existsSync(config)) {
            config = resolve(dirname(fileURLToPath(import.meta.url)), '../..', '.buildable');
        }

        const configuration =  JSON.parse(readFileSync(config, { encoding: 'utf-8' }));
        if (!configuration) return;

        Object.keys(this.#options).forEach((key) => {
            if (configuration[key]) this.#options[key] = configuration[key];
        });
    }
}
