#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import run from '../lib/cli/run.js';
import dependencyGraph from '../lib/cli/dependency-graph.js';
import executionOrder from '../lib/cli/execution-order.js';

yargs(hideBin(process.argv))
    .command(run.name, run.description, run.builder, run.handler)
    .command(dependencyGraph.name, dependencyGraph.description, dependencyGraph.builder, dependencyGraph.handler)
    .command(executionOrder.name, executionOrder.description, executionOrder.builder, executionOrder.handler)
    .option('path', { alias: 'p', description: 'Relative path to packages directory (default: packages)', type: 'string' })
    .option('exclude', { alias: 'e', description: 'List of excluded packages', type: 'array' })
    .option('config', { alias: 'c', description: 'Relative path to configuration file (TBD)', type: 'string' })
    .parse();
