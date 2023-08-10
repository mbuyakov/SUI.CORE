import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, readProjectConfiguration } from "@nx/devkit";
import libGenerator from "./generator";


describe("lib generator", () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await libGenerator(tree, {name: "test", type: "lib"});
    const config = readProjectConfiguration(tree, "lib-test");
    expect(config).toBeDefined();
  });
});
