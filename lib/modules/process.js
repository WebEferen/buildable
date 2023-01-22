import chalk from 'chalk';
import concurrently from 'concurrently';
import { BehaviorSubject } from 'rxjs';

import { Readiness } from './readiness.js';

export class ProcessManager {
    #queue = new BehaviorSubject();
    #completed = new BehaviorSubject();
    #readiness = new Readiness();

    #listeners;
    #processes;
    #executions = [];

    constructor() {
        this.#listeners = {};
        this.#processes = {};
    }

    setExecutions(command, queue = [], dependencies = {}) {
        console.info(`${chalk.green('✔︎')} Found ${chalk.bold(queue.length)} items in queue...`);

        queue.forEach((entrypoint) => {
            console.info(`${chalk.green('❍')} ${chalk.gray(`${entrypoint.name} @ v${entrypoint.version}`)}`);

            this.#executions.push({
                name: entrypoint.name,
                command: command,
                cwd: entrypoint.directory,
                dependsOn: dependencies[entrypoint.name]
            });
        });

        console.info('\n');
    }

    // Run lowest dependant and go straight up.
    // f.e if A depends on B and B depends on C
    // then we need to build C first, then B and lastly go for an A
    async #concurrentlyRun(scripts) {
        const { commands, result } = concurrently(scripts, { outputStream: { write: () => {} }, successCondition: 'all' });
        const processes = this.#getProcesses(commands);
        this.#parseProcesses(processes);

        return result;
    }


    spawn() {
        this.#queue.next(this.#executions.shift());
        this.#completed.next(false);

        this.#queue.subscribe(async (execution) => {
            if (execution.completed) {
                await new Promise((resolve) => setTimeout(() => resolve(), 2500));
                return this.#completed.next(true);
            }

            await this.#concurrentlyRun([execution]).catch((error) => {
                const formatted = chalk.red.bold(`[${execution.name}]`);
                const message = chalk.red(`Error during running package script!`);
                console.error(`❌ ${formatted} ${message}`);

                this.#processes.forEach((entry) => entry.kill());
                process.exit(0);
            });
        });

        this.#completed.subscribe((completed) => {
            if (!completed) return;

            console.info(`\n\n💚 ${chalk.green.bold('All of the services are up and running!')}`);
            console.info(`${chalk.green.bold('May the linking be with you!')}\n\n`);
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
        }));
    }

    #parseProcesses(processes = []) {
        processes.forEach((processEntry) => {
            this.#processes[processEntry.name] = processEntry;
            this.#attachListener(processEntry);
        });
    }

    #isServiceReady(output) {
        const { isMatch } = this.#readiness.check(output);
        if (isMatch && this.#executions.length > 0) {
            this.#queue.next(this.#executions.shift());
            return true;
        }

        return false;
    }

    #closeExecutionHandler() {
        if (this.#executions.length === 0 && !this.#queue.closed) {
            this.#queue.next({ completed: true });
            this.#queue.complete();
        }
    }

    #attachListener(entry) {
        this.#listeners[entry.name] = entry.listener.subscribe((buffer) => {
            const output = String(buffer.toString()).split('\n')
                .filter((line) => line !== '\x1Bc')
                .filter((line) => line)
                .map((line) => this.#formatMessage(entry, line))
                .join('\n');
                
            console.info(output);
                
            if (this.#isServiceReady(output)) return;
            this.#closeExecutionHandler();
        });
    }

    #formatMessage(entry, message = '') {
        const format = chalk[entry.color] ?? chalk.gray;
        const packageName = format(`[${entry.name}]`);

        return `${packageName} ${message}`;
    }
}
