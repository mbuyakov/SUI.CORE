import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import {Tree, readProjectConfiguration} from "@nx/devkit";

import { indexGenerator } from "./generator";
import { IndexGeneratorSchema } from "./schema";
import libGenerator from "../lib/generator";

describe("index generator", () => {
  let tree: Tree;
  const options: IndexGeneratorSchema = { name: "test" };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await libGenerator(tree, {
      type: "lib",
      name: "test"
    });
    const config = readProjectConfiguration(tree, "lib-test");
    tree.delete(`${config.sourceRoot}/index.ts`);
    tree.delete(`${config.sourceRoot}/lib/lib-test.ts`);
    tree.delete(`${config.sourceRoot}/lib`);
  });

  it("should generate index with files", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    tree.write(`${config.sourceRoot}/a.ts`, "");
    tree.write(`${config.sourceRoot}/b.ts`, "");
    tree.write(`${config.sourceRoot}/b.spec.ts`, "");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString().trim()).toBe(`
export * from "./a";
export * from "./b";
`.trim());
  });

  it("should update index file if contains only imports", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    tree.write(`${config.sourceRoot}/a.ts`, "");
    tree.write(`${config.sourceRoot}/b.ts`, "");
    tree.write(`${config.sourceRoot}/index.ts`, "export * from \"./a\";");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString().trim()).toBe(`
export * from "./a";
export * from "./b";
`.trim());
  });

  it("should skip if index file has custom data", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    tree.write(`${config.sourceRoot}/a.ts`, "");
    tree.write(`${config.sourceRoot}/b.ts`, "");
    tree.write(`${config.sourceRoot}/index.ts`, "test");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString()).toBe("test");
  });

  it("should generate index with folders", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    tree.write(`${config.sourceRoot}/__snapshots__/tmp.txt`, "");
    tree.write(`${config.sourceRoot}/a/a.ts`, "");
    tree.write(`${config.sourceRoot}/b/b.ts`, "");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString().trim()).toBe(`
export * from "./a";
export * from "./b";
`.trim());
    expect(tree.read(`${config.sourceRoot}/a/index.ts`).toString().trim()).toBe("export * from \"./a\";");
    expect(tree.read(`${config.sourceRoot}/b/index.ts`).toString().trim()).toBe("export * from \"./b\";");
  });

  it("should generate index with files and folders", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    tree.write(`${config.sourceRoot}/a/a.ts`, "");
    tree.write(`${config.sourceRoot}/b/b.ts`, "");
    tree.write(`${config.sourceRoot}/c.ts`, "");
    tree.write(`${config.sourceRoot}/d.ts`, "");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/index.ts`).toString().trim()).toBe(`
export * from "./a";
export * from "./b";

export * from "./c";
export * from "./d";
`.trim());
  });

  it("should generate index in sub-folder", async () => {
    const config = readProjectConfiguration(tree, "lib-test");
    tree.write(`${config.sourceRoot}/a/a.ts`, "");
    tree.write(`${config.sourceRoot}/a/b.ts`, "");
    await indexGenerator(tree, options);
    expect(tree.read(`${config.sourceRoot}/a/index.ts`).toString().trim()).toBe("export * from \"./a\";\nexport * from \"./b\";");
  });
});
