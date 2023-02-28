# Buildable

![CI](https://github.com/webeferen/buildable/actions/workflows/ci.yml/badge.svg?branch=main)
![Publish package](https://github.com/webeferen/buildable/actions/workflows/publish.yml/badge.svg?branch=main)
[![Npm Version](https://badge.fury.io/js/@webeferen%2Fbuildable.svg)](https://badge.fury.io/js/@webeferen%2Fbuildable)

Link your local repositories and dependencies quickly, without any additional knowledge.

- [Installation](#installation)
- [Usage](#usage)
  - [Help & Version](#help)
  - [Run Script](#run-script)
  - [Dependency Graph](#dependency-graph)
  - [Execution Order](#execution-order)
- [Contributing](#contributing)
- [License](#license)

## Installation

Buildable is made to work with each of installation type such as local, global and npx.

Local scope

```bash
npm install --save-dev @webeferen/buildable
```

Global scope

```bash
npm install --global @webeferen/buildable
```

It can be also used via npx

```bash
npx @webeferen/buildable [command]
```

## Usage

```bash
buildable [command] (...options)
```

### Help

This command prints out useful information such as available commands and options.

```bash
buildable help
```

Prints out currently used version of the package

```bash
buildable --version
```

### Run Script

This command runs specified command for **each project** inside directory.

```bash
buildable run (r) "script name" (...options)
```

### Dependency Graph

This command generates dependency graph with every dependency inside workspace (linking them with correct versions). Graph only shows relations between local dependencies.

```bash
buildable dependency-graph (dg) (...options)
```

### Execution Order

This command generates execution order in which projects should be run to avoid build order issues. It only takes into consideration local dependencies.

```bash
buildable execution-order (eo) (...options)
```

#### Available options

- `--listeners (-l)` List of comma separated texts when achieve next process can be run (regex check)
- `--only (-o)` List of comma separated projects that will only be run (with their dependencies)
- `--exclude (-e)` List of comma separated packages which should be excluded
- `--path (-p)` Relative path to the directory containing workspace (if any)
- `--config (-c)` Relative path to the configuration file
- `--reload (-r)` List of comma separated packages which can be manually reloaded

## Example configuration

Example configuration can be found [here](EXAMPLE.md).

## Possible issues

There were some cases where buildable was not able to kill child process by itself. If that happens, this command might help to clean the ports up:

```bash
kill -9 $(lsof -ti:[port])
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
