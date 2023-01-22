export class Readiness {
    // TODO: Load rulesets for common (hapijs, tsc, nodemon)
    #rules = {
        tsc: "Watching for file changes",
        nodemon: "waiting for changes before restart",
        custom: "log,instance,started"
    };

    constructor(rules = {}) {
        this.#rules = {...this.#rules, ...rules};
    }

    check(output) {
        const entry = Object.entries(this.#rules).find(([watcher, rule]) => RegExp(rule, 'gm').test(output) );
        return (entry) ? { isMatch: true, watcher: entry } : { isMatch: false, watcher: null };
    }

    addRule(watcher, rule) {
        this.#rules[watcher] = rule;
    }
}
