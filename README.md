# Buildable - Monorepo CLI

Running internal command:
> npm run buildable help

Or install package globally using:
> npm install -g @webeferen/buildable

... and then just use:
> buildable help

## Available commands

### Buildable Help

Command that prints out help page with commands and options.
> buildable help

### Buildable Dependency Graph

Command that prints out dependency graph.
> buildable dependency-graph

### Buildable Execution Order

Command that prints execution order in which the scripts will be run.
> buildable execution-order

## Available options

> --exclude package1,package2

List of excluded packages from the builder

> --path path

Path to the packages folder in which buildable searches for package.json(s)

> --only package

Runs only the specified package with it's dependencies.
