import { Logger } from "./logger.js";

export class Listener {
  #logger;

  #info = {};
  #crashes = {};
  #executions = [];

  constructor(logger) {
    this.#logger = logger ? logger : new Logger(options);
  }

  attachQueueListener(queue, listener = async (_execution) => {}) {
    queue.subscribe(async (execution) => listener(execution));
  }

  attachInfoListener(entry, listener = (_output) => {}) {
    this.#info[entry.name] = entry.listener.subscribe((buffer) => {
      const output = String(buffer.toString())
        .split("\n")
        .filter((line) => line !== "\x1Bc")
        .filter((line) => line)
        .map((line) => this.#formatMessage(entry, line))
        .join("\n");

      this.#logger.log(output);
      listener(output);
    });
  }

  detachInfoListener(entry) {
    if (!this.#info[entry.name]) return;
    this.#info[entry.name].unsubscribe();
    delete this.#info[entry.name];
  }

  attachCrashListener(entry, _queue) {
    this.#crashes[entry.name] = entry.crash.subscribe((buffer) => {
      const output = String(buffer.toString())
        .split("\n")
        .filter((line) => line !== "\x1Bc")
        .filter((line) => line)
        .map((line) => this.#formatMessage(entry, line, "gray"))
        .join("\n");

      this.#logger.error(output);
    });
  }

  detachCrashListener(entry) {
    if (!this.#crashes[entry.name]) return;
    this.#crashes[entry.name].unsubscribe();
    delete this.#crashes[entry.name];
  }

  #formatMessage(entry, message = "", messageColor = undefined) {
    const name = this.#logger.format(`[${entry.name}]`, entry.color ?? "gray");
    const formatted = this.#logger.format(message, messageColor);

    return `${name} ${formatted}`;
  }
}
