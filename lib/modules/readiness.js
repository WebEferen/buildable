export class Readiness {
    // TODO: Load rulesets for common (hapijs, tsc, nodemon)
    #rules = {
        tsc: "Watching for file changes",
        nodemon: "waiting for changes before restart",
    };

    constructor(rules = {}) {
        this.#rules = {...this.#rules, ...rules};
    }

    check(output) {
        const entry = Object.entries(this.#rules).find(([watcher, rule]) => output.includes(rule));
        return (entry) ? { isMatch: true, watcher: entry } : { isMatch: false, watcher: null };
    }

    addRule(watcher, rule) {
        this.#rules[watcher] = rule;
    }
}
