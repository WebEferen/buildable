import concurrently from 'concurrently';
import { BehaviorSubject } from 'rxjs';

import { Readiness } from './readiness.js';
import { CliOptions } from './options.js';
import { Logger } from './logger.js';

export class ProcessManager {
    #options = new CliOptions();
    #queue = new BehaviorSubject();
    #readiness = new Readiness();
    #logger = new Logger();

    #listeners = {};
    #crashes = {};

    #processes = {};
    #executions = [];

    constructor(options, readiness, logger) {
        if (options) this.#options = options;
        if (readiness) this.#readiness = readiness;
        if (logger) this.#logger = logger;
    }

    setExecutions(queue = [], dependencies = {}) {
        const command = this.#options.getScript();

        const prefix = this.#logger.format('✔︎', 'green');
        this.#logger.log(`Found ${queue.length} items in queue...`, prefix);

        queue.forEach((entrypoint) => {
            const prefix = this.#logger.format('❍', 'green');
            const message = this.#logger.format(`${entrypoint.name} @ v${entrypoint.version}`, 'gray');
            this.#logger.log(message, prefix);

            this.#executions.push({
                name: entrypoint.name,
                command: command,
                cwd: entrypoint.directory,
                dependsOn: dependencies[entrypoint.name]
            });
        });

        this.#logger.info('\n');
    }

    async #concurrentlyRun(scripts) {
        const { commands, result } = concurrently(scripts, { outputStream: { write: () => {} }, successCondition: 'all' });
        const processes = this.#getProcesses(commands);
        this.#parseProcesses(processes);

        return result;
    }


    spawn() {
        this.#queue.next(this.#executions.shift());

        this.#queue.subscribe(async (execution) => {
            await this.#concurrentlyRun([execution]).catch((failures) => {
                this.#logger.error(`Shutting down script due to an error.`, `[${execution.name}]`, 'red');

                Object.values(this.#processes).forEach((entry) => entry.kill());
                process.exit(0);
            });
        });
    }

    #getProcesses(commands = []) {
        return commands.map(command => ({
            script: command.command,
            name: command.name,
            color: command.prefixColor || 'green',
            pid: command.pid,
            cwd: command.cwd,
            kill: command.kill,
            start: command.start,
            listener: command.stdout,
            crash: command.stderr
        }));
    }

    #parseProcesses(processes = []) {
        processes.forEach((processEntry) => {
            this.#processes[processEntry.name] = processEntry;
            this.#attachListener(processEntry);
            this.#attachCrashListener(processEntry);
        });
    }

    #isServiceReady(output) {
        const isMatch = this.#readiness.check(output);
        if (isMatch && this.#executions.length > 0) {
            this.#queue.next(this.#executions.shift());
            return true;
        }

        return false;
    }

    #attachListener(entry) {
        this.#listeners[entry.name] = entry.listener.subscribe((buffer) => {
            const output = String(buffer.toString()).split('\n')
                .filter((line) => line !== '\x1Bc')
                .filter((line) => line)
                .map((line) => this.#formatMessage(entry, line))
                .join('\n');
                
            this.#logger.log(output);
                
            if (this.#isServiceReady(output)) return;
        });
    }

    #attachCrashListener(entry) {
        this.#crashes[entry.name] = entry.crash.subscribe((buffer) => {
            const output = String(buffer.toString()).split('\n')
                .filter((line) => line !== '\x1Bc')
                .filter((line) => line)
                .map((line) => this.#formatMessage(entry, line, 'gray'))
                .join('\n');
                
            this.#logger.error(output);
        });
    }

    #formatMessage(entry, message = '', messageColor = undefined) {
        const name = this.#logger.format(`[${entry.name}]`, entry.color ?? 'gray');
        const formatted = this.#logger.format(message, messageColor);

        return `${name} ${formatted}`;
    }
}
