import { CliOptions } from "../../lib/modules/options.js";

describe("Options", () => {
  it("should use default configuration", () => {
    const options = new CliOptions();
    const { path, script, only, listeners, exclude, customLoggers } =
      options.getOptions();

    expect(path).toBeNull();
    expect(script).toBeNull();

    expect(only.length).toBe(0);
    expect(listeners.length).toBe(6);
    expect(exclude.length).toBe(0);

    expect(customLoggers).toEqual({
      log: null,
      verbose: null,
      error: null,
    });
  });

  it("should load configuration", () => {
    const options = new CliOptions({ config: "tests/mocks/.buildable-mock" });
    const { script, exclude, runner } = options.getOptions();

    expect(script).toBe("test");
    expect(exclude.length).toBe(1);

    const { executable, options: runnerOptions } = runner;
    expect(runnerOptions).toBeDefined();
    expect(executable).not.toBeNull();
  });

  it("should not load configuration", () => {
    const options = new CliOptions({ config: "tests/mocks/.not-existing" });
    const { script, exclude } = options.getOptions();

    expect(script).toBeNull();
    expect(exclude.length).toBe(0);
  });
});
