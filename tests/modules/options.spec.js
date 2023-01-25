import { CliOptions } from "../../lib/modules/options.js";

describe("Options", () => {
  it("should use default configuration", () => {
    const options = new CliOptions();

    expect(options.getPath()).toContain("packages");
    expect(options.getScript()).toBeNull();

    expect(options.getOnly().length).toBe(0);
    expect(options.getListeners().length).toBe(6);
    expect(options.getExcluded().length).toBe(0);

    expect(options.getCustomLoggers()).toEqual({
      log: null,
      verbose: null,
      error: null,
    });
  });

  it("should load configuration", () => {
    const options = new CliOptions({ config: "tests/mocks/.buildable-mock" });

    expect(options.getScript()).toBe("test");
    expect(options.getExcluded().length).toBe(1);

    const { executable, options: runnerOptions } = options.getRunner();
    expect(runnerOptions).toBeDefined();
    expect(executable).not.toBeNull();
  });

  it("should not load configuration", () => {
    const options = new CliOptions({ config: "tests/mocks/.not-existing" });

    expect(options.getScript()).toBeNull();
    expect(options.getExcluded().length).toBe(0);
  });
});
