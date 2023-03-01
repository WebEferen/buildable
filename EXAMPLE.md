# Buildable Example Configuration

The base configuration for buildable looks like this:

```json
{
  "only": [],
  "exclude": [],
  "listeners": [
    "Watching for file changes",
    "waiting for changes before restart"
  ],
  "path": "packages",
  "customCommands": {
    "npm run start": {
      "package-a": "npm run start-alias"
    }
  },
  "verbose": false,
  "runner": null,
  "customLoggers": {
    "log": null,
    "verbose": null,
    "error": null
  },
  "reload": []
}
```

## API

### Only

Runs only selected packages (and their dependencies to be error-safe)

> buildable run --only PACKAGE-A PACKAGE-B

This command will run only selected packages with their dependencies. There is an option to run single package with unsafe mode - in order to do that, `--no-safe` flag needs to be applied. By default `safe` flag is set to true.

> buildable run --only PACKAGE-A --no-safe

### Exclude

Exclude packages from run (without dependencies)

> buildable run --exclude PACKAGE-B

### Listeners

Listeners for events printed in the console (to keep ordered builds).
When the output matches given strings, next process is starting.

> buildable run --listeners "String or regex" /Regex/

### Path

Relative path to the workspace packages directory (default: packages).

> buildable run --path relative-path

### Custom Commands

Aliases for the script runner (if there is need to run other named processes).
Initial script command is taken as a key command.
If the command matches the key, script searches for corresponding package command.
If the package command is not present, the keyed command is used.
Package name (package.json name) as the key and as the value command which should be run.

> This setting can be set via CLI but might be unsafe to pass object in stringified version. It is not recommended to use it this way.

### Verbose

Enable verbose logging for every project.

> buildable run --verbose

### Reload

Packages which can be manually reloaded (using interactive actions).
Each package will have it's own index pinned to it. Using keyboard numbers the service can be easily reloaded.

> buildable run --reload PACKAGE-A PACKAGE-B

### Custom Runner

Custom command runner (default: concurrently).

> It is not safe to use it via CLI. For config file it can be replaced by nodemon, tsc-watch or other watcher.

### Custom Logger

Custom loggers (default: console.\*). In order to work it need to implement 3 interfaces (log, verbose, error). It works well with console.log and winston.

> It is not safe to use it via CLI. For config file it can be replaced by winston, pino or other logger.
