import { concurrently } from "concurrently";
import { CliOptions } from "../../lib/modules/options.js";
import { ProcessManager } from "../../lib/modules/process.js";
import { DependencyGraph } from "../../lib/modules/graph.js";
import { Finder } from "../../lib/modules/finder.js";

describe("ProcessManager", () => {
  const createConcurrentlySpy = (script) =>
    jasmine
      .createSpy("concurrently", concurrently)
      .and.callFake(([command]) => {
        expect(command.name).toBe("single-repo");
        expect(command.command).toBe(script);

        return { commands: [], result: [] };
      });

  const loggerMock = () => {};
  const createRunnerMock = (executable) => ({
    executable: executable,
    options: { outputStream: { write: () => {} }, successCondition: "all" },
  });

  it("should run script", async () => {
    const script = "ls";

    const concurrentlySpy = createConcurrentlySpy(script);
    const options = new CliOptions({
      path: "examples/single-repo",
      script: script,
      runner: createRunnerMock(concurrentlySpy),
      customLoggers: { log: loggerMock },
    });

    const graph = new DependencyGraph(options);
    const manager = new ProcessManager(options);
    graph.setPackages(await new Finder(options).findPackages());
    graph.generate();

    const { order, dependencies } = graph.getGraph();
    manager.setExecutions(order, dependencies);
    manager.spawn();
  });
});
