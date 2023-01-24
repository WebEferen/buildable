#!/usr/bin/env node
import update from "update-notifier";
import cli from "../lib/cli/cli.js";
import { readJsonFile } from "../lib/utils/read-file.js";

update({ pkg: readJsonFile("package.json", process.cwd()) }).notify();
cli.parse();
