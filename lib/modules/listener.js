import { Logger } from "./logger.js";

export class Listener {
  #logger;

  #info = {};
  #crashes = {};

  constructor(logger) {
    this.#logger = logger ?? new Logger(options);
  }

  attachQueueListener(queue, listener = async (_execution) => {}) {
    queue.subscribe(async (execution) => listener(execution));
  }

  attachInfoListener(entry, listener = (_output) => {}) {
    this.#detachInfoListener(entry.name);
    this.#info[entry.name] = entry.listener.subscribe((buffer) => {
      const output = String(buffer.toString())
        .split("\n")
        .filter((line) => line !== "\x1Bc")
        .filter((line) => line)
        .map((line) => this.#formatMessage(entry, line))
        .join("\n");

      listener(output);
    });
  }

  attachCrashListener(entry, listener = (_output) => {}) {
    this.#detachCrashListener(entry.name);
    this.#crashes[entry.name] = entry.crash.subscribe((buffer) => {
      const output = String(buffer.toString())
        .split("\n")
        .filter((line) => line !== "\x1Bc")
        .filter((line) => line)
        .map((line) => this.#formatMessage(entry, line, "gray"))
        .join("\n");

      listener(output);
    });
  }

  #detachInfoListener(service) {
    if (!this.#info[service]) return;
    this.#info[service].unsubscribe();
    delete this.#info[service];
  }

  #detachCrashListener(service) {
    if (!this.#crashes[service]) return;
    this.#crashes[service].unsubscribe();
    delete this.#crashes[service];
  }

  #formatMessage(entry, message = "", messageColor = undefined) {
    const name = this.#logger.format(`[${entry.name}]`, entry.color ?? "gray");
    const formatted = this.#logger.format(message, messageColor);

    return `${name} ${formatted}`;
  }
}
