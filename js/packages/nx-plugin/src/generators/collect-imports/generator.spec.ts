import {createTreeWithEmptyWorkspace} from "@nx/devkit/testing";
import {ProjectConfiguration, readProjectConfiguration, Tree} from "@nx/devkit";

import {collectImportsGenerator, MAP_FILE_PATH} from "./generator";
import {CollectImportsGeneratorSchema} from "./schema";
import libGenerator from "../lib/generator";

describe("collect imports", () => {
  let tree: Tree;
  let config: ProjectConfiguration;
  const options: CollectImportsGeneratorSchema = {};

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await libGenerator(tree, {
      type: "lib",
      name: "test"
    });
    config = readProjectConfiguration(tree, "lib-test");
  });

  it("should collect imports for test lib", async () => {
    tree.write(MAP_FILE_PATH, "");
    await collectImportsGenerator(tree, options);
    expect(tree.read(MAP_FILE_PATH).toString().trim()).toMatchSnapshot();
  });
});
