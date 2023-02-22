import { CliOptions } from "../../lib/modules/options.js";
import { DependencyGraph } from "../../lib/modules/graph.js";

describe("DependencyGraph", () => {
  it("should not find package with wrong path", async () => {
    const options = new CliOptions({
      path: "/not/existing",
      customLoggers: { error: (..._) => {} },
    });
    const graph = new DependencyGraph(options);
    const { packages } = await graph.generate();

    expect(packages.length).toBe(0);
  });

  it("Should find packages within monorepo path", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    const { packages } = await graph.generate();

    expect(packages.length).toBe(2);
  });

  it("Should find packages within single-repo path", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    const { packages } = await graph.generate();

    expect(packages.length).toBe(2);
  });

  it("Should not have execution order before generation", async () => {
    const options = new CliOptions({ path: "examples/monorepo", workspace: false });
    const graph = new DependencyGraph(options);
    const { order } = await graph.generate();

    expect(order.length).toBe(0);
  });

  it("Should have correct execution order after generation", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);

    const { order } = await graph.generate();
    const names = order.map((order) => order.name);

    expect(names.length).toBe(2);
    expect(names).toEqual(["package-b", "package-a"]);
  });

  it("Should have correct dependencies", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);

    const { dependencies } = await graph.generate();
    const deps = Object.keys(dependencies);

    expect(deps.length).toBe(2);
    expect(deps).toEqual(["package-a", "package-b"]);
  });
});
