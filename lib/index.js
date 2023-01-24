import update from 'update-notifier';
import packageJson from '../package.json' assert { type: 'json' };

import { DependencyGraph } from "./modules/graph.js";
import { Logger } from "./modules/logger.js";
import { CliOptions } from "./modules/options.js";
import { ProcessManager } from "./modules/process.js";
import { Readiness } from "./modules/readiness.js";

update({ pkg: packageJson }).notify();

export { CliOptions, DependencyGraph, Logger, ProcessManager, Readiness };
