import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import {Tree, readProjectConfiguration} from "@nx/devkit";

import { indexGenerator } from "./generator";
import { IndexGeneratorSchema } from "./schema";
import libGenerator from "../lib/generator";

describe("index generator", () => {
  let tree: Tree;
  const options: IndexGeneratorSchema = { name: "test" };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    libGenerator(tree, {
      type: "lib",
      name: "test"
    });
  });

  it("should run successfully", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    expect(config).toBeDefined();
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString()).toBe("export * from './lib/lib-test';\n");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString()).toBe("export * from \"./lib\";\n");
    expect(tree.read(`${config.sourceRoot}/lib/index.ts`).toString()).toBe("export * from \"./lib-test\";\n");
  });
});
