import { CliOptions } from "../../lib/modules/options.js";
import { DependencyGraph } from "../../lib/modules/graph.js";
import { Finder } from "../../lib/modules/finder.js";

describe("DependencyGraph", () => {
  it("should not find package with wrong path", async () => {
    const options = new CliOptions({
      path: "/not/existing",
      customLoggers: { error: (..._) => {} },
    });
    const graph = new DependencyGraph(options);
    graph.setPackages(await new Finder(options).findPackages());
    const { packages } = graph.getGraph();

    expect(packages.length).toBe(0);
  });

  it("Should find packages within monorepo path", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    graph.setPackages(await new Finder(options).findPackages());
    const { packages } = graph.getGraph();

    expect(packages.length).toBe(2);
  });

  it("Should find packages within single-repo path", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    graph.setPackages(await new Finder(options).findPackages());
    const { packages } = graph.getGraph();

    expect(packages.length).toBe(2);
  });

  it("Should not have execution order before generation", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    graph.setPackages(await new Finder(options).findPackages());
    const { order } = graph.getGraph();

    expect(order.length).toBe(0);
  });

  it("Should have correct execution order after generation", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    graph.setPackages(await new Finder(options).findPackages());
    graph.generate();

    const { order } = graph.getGraph();
    const names = order.map((order) => order.name);

    expect(names.length).toBe(2);
    expect(names).toEqual(["package-b", "package-a"]);
  });

  it("Should have correct dependencies", async () => {
    const options = new CliOptions({ path: "examples/monorepo" });
    const graph = new DependencyGraph(options);
    graph.setPackages(await new Finder(options).findPackages());
    graph.generate();

    const { dependencies } = graph.getGraph();
    const deps = Object.keys(dependencies);

    expect(deps.length).toBe(2);
    expect(deps).toEqual(["package-a", "package-b"]);
  });
});
