import { CliOptions } from './options.js';

export class Readiness {
    #options;

    constructor(options) {
        this.#options = options ? options : new CliOptions();
    }

    check(output) {
        const rules = this.#options.getListeners();
        const entry = rules.find((rule) => RegExp(rule, 'gm').test(output) );

        return (entry) ? true : false;
    }
}
