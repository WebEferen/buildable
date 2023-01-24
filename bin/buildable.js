#!/usr/bin/env node
import update from "update-notifier";
import cli from "../lib/cli/cli.js";
import packageJson from "../package.json" assert { type: "json" };

update({ pkg: packageJson }).notify();

cli.parse();
