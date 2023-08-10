import {createTreeWithEmptyWorkspace} from "@nx/devkit/testing";
import {readJson, Tree} from "@nx/devkit";
import libGenerator from "../generators/lib/generator";


describe("common tweaks", () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should update ui-old-core tsconfig", async () => {
    tree.write("packages/ui-old-core/tsconfig.json", JSON.stringify({
      compilerOptions: {
        paths: {}
      }
    }));
    await libGenerator(tree, {name: "test", type: "lib"});
    expect(readJson(tree, "packages/ui-old-core/tsconfig.json").compilerOptions.paths).toEqual({
      "@/*": [
        "packages/ui-old-core/src/*"
      ],
      "@sui/lib-test": [
        "packages/lib-test/src/index.ts"
      ]
    });
  });

  it("should update ui-old-react tsconfig", async () => {
    tree.write("packages/ui-old-react/tsconfig.json", JSON.stringify({
      compilerOptions: {
        paths: {}
      }
    }));
    await libGenerator(tree, {name: "test", type: "lib"});
    expect(readJson(tree, "packages/ui-old-react/tsconfig.json").compilerOptions.paths).toEqual({
      "@/*": [
        "packages/ui-old-react/src/*"
      ],
      "@sui/lib-test": [
        "packages/lib-test/src/index.ts"
      ]
    });
  });

  it("should update bundle-all deps", async () => {
    tree.write("packages/bundle-all/package.json", JSON.stringify({
      dependencies: {}
    }));
    await libGenerator(tree, {name: "test", type: "lib"});
    expect(readJson(tree, "packages/bundle-all/package.json").dependencies).toEqual({
      "@sui/lib-test": "0.0.1"
    });
  });
});
