#!/usr/bin/env node
import update from "update-notifier";
import cli from "../lib/cli/cli.js";
import { readFile } from "../lib/utils/read-file.js";

update({ pkg: readFile("package.json", process.cwd()) }).notify();
cli.parse();
