import { concurrently } from 'concurrently';
import { resolve } from 'node:path';

import { readJsonFile } from '../utils/read-file.js';

export class CliOptions {
    #options = {
        listeners: [],
        exclude: [],
        path: null,
        script: null,
        verbose: false,
        runner: {
            options: {},
            executable: null
        },
        customLoggers: {
            log: null,
            verbose: null,
            error: null,
        }
    };

    constructor(options) {
        this.#loadConfiguration(options);
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

    getRunner() {
        return this.#options.runner;
    }

    getCustomLoggers() {
        return this.#options.customLoggers;
    }

    #loadFromCli(options = {}) {
        if (options.exclude) this.#options.exclude.push(...String(options.exclude || '').split(','));
        if (options.listeners) this.#options.listeners.push(...String(options.listeners || '').split(','));
        if (options.customLoggers) this.#options.customLoggers = options.customLoggers;
        if (options.verbose) this.#options.verbose = Boolean(options.verbose);
        if (options.script) this.#options.script = String(options.script);
        if (options.path) this.#options.path = String(options.path);

        this.#loadRunner(options);
    }

    #loadRunner(options) {
        if (!options.runner) options.runner = {
            options: { outputStream: { write: () => {} }, successCondition: 'all' },
            executable: concurrently
        };

        if (typeof options.runner.executable === 'function') {
            this.#options.runner = options.runner;
        }
    }

    #loadConfiguration(options = {}) {
        const baseConfiguration = readJsonFile('.buildable');
        const userConfiguration = readJsonFile(options.config ? options.config : '.buildable', process.cwd());

        Object.keys(this.#options).forEach((key) => {
            if (baseConfiguration[key]) this.#options[key] = baseConfiguration[key];

            if (userConfiguration[key]) {
                (Array.isArray(userConfiguration[key])) ?
                    this.#options[key].push(...userConfiguration[key]) :
                    this.#options[key] = userConfiguration[key];
            }
        });
    }
}
