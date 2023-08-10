import {createTreeWithEmptyWorkspace} from "@nx/devkit/testing";
import {readProjectConfiguration, Tree} from "@nx/devkit";
import {reactLibGenerator} from "./generator";


describe("react-lib generator", () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await reactLibGenerator(tree, {name: "test", type: "lib"});
    const config = readProjectConfiguration(tree, "lib-test");
    expect(config).toBeDefined();
  });
});
