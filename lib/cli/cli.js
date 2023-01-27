import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readJsonFile } from "../utils/read-file.js";

import run from "./run.js";
import install from "./install.js";
import dependencyGraph from "./dependency-graph.js";
import executionOrder from "./execution-order.js";

export default yargs(hideBin(process.argv))
  .version(readJsonFile("package.json").version)
  .command([run.name, run.alias], run.description, run.builder, run.handler)
  .command(
    [install.name, install.alias],
    install.description,
    install.builder,
    install.handler
  )
  .command(
    [dependencyGraph.name, dependencyGraph.alias],
    dependencyGraph.description,
    dependencyGraph.builder,
    dependencyGraph.handler
  )
  .command(
    [executionOrder.name, executionOrder.alias],
    executionOrder.description,
    executionOrder.builder,
    executionOrder.handler
  )
  .option("path", {
    alias: "p",
    description: "Relative path to packages directory",
    default: "packages",
  })
  .option("exclude", {
    alias: "e",
    description: "List of excluded packages",
    type: "array",
  })
  .option("workspaces", {
    alias: "w",
    description: "Use npm workspaces",
    type: "boolean",
  })
  .option("config", {
    alias: "c",
    description: "Relative path to configuration file (TBD)",
    type: "string",
  });
