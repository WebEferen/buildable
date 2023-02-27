import { CliOptions } from "./options.js";

export class Readiness {
  #options;

  constructor(options) {
    this.#options = options ?? new CliOptions();
  }

  check(output) {
    const { listeners } = this.#options.getOptions();
    const entry = listeners.find((rule) => RegExp(rule, "gm").test(output));

    return entry ? true : false;
  }
}
