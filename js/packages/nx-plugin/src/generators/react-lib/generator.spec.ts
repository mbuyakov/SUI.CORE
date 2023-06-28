import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, readProjectConfiguration } from "@nx/devkit";

import { reactLibGenerator } from "./generator";
import { ReactLibGeneratorSchema } from "./schema";

describe("react-lib generator", () => {
  let tree: Tree;
  const options: ReactLibGeneratorSchema = { name: "test", type: "lib" };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await reactLibGenerator(tree, options);
    const config = readProjectConfiguration(tree, "lib-test");
    expect(config).toBeDefined();
  });
});
