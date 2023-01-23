import chalk from 'chalk';
import { CliOptions } from './options.js';

export class Logger {
    #options = new CliOptions();

    #logger = console.log;
    #verboseLogger = console.debug;
    #errorLogger = console.error;

    constructor(options) {
        this.#options = options;
    }

    log(message, prefix = '') {
        const formatted = prefix.length > 0 ? `${prefix} ` : '';
        return this.#logger(`${formatted}${message}`);
    }

    verbose(message, prefix = '') {
        if (!this.#options || !this.#options.getVerbose()) return;
 
        const formatted = prefix.length > 0 ? `${prefix} ` : '';
        const verbose = chalk.yellow('[Verbose]');

        return this.#verboseLogger(`${verbose} ${formatted}${message}`);
    }

    error(message, prefix = '', color = 'red') {
        const formatted = prefix.length > 0 ? `${prefix} ` : '';
        return this.#errorLogger(chalk[color](`${formatted}${message}`));
    }

    format(message, color) {
        const output = color ? chalk[color] : chalk;
        return output(message);
    }
}
