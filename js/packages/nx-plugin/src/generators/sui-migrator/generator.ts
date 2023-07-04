import {Tree} from "@nx/devkit";
import {tsquery} from "@phenomnomnominal/tsquery";
import {getProjects} from "nx/src/generators/utils/project-configuration";
import {SuiMigratorGeneratorSchema} from "./schema";

function visitAllFiles(
  tree: Tree,
  path: string,
  callback: (filePath: string) => void
) {
  tree.children(path).forEach((fileName) => {
    const filePath = `${path}/${fileName}`;
    console.log(`Process path ${filePath}`);
    if (!tree.isFile(filePath)) {
      visitAllFiles(tree, filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

const mapModules = {
  "@material-ui/core": "@sui/deps-material",
  "@mui/material": "@sui/deps-material",
  "antd": "@sui/deps-antd",
  "typescript-ioc": "@sui/deps-ioc",
  "@sui/amcharts": "@sui/deps-amcharts",
};

export function remapImports(projectName: string, content: string): string {
  Object.keys(mapModules).forEach(oldName => {
    const newName = mapModules[oldName];
    if (newName == `@sui/${projectName}`) {
      return;
    }
    content = tsquery.replace(content, `ImportDeclaration:has(StringLiteral[value="${oldName}"])`, node => node.getText().replace(oldName, newName));
  });

  return content;
}

export async function suiMigratorGenerator(tree: Tree, schema: SuiMigratorGeneratorSchema) {
  const projects = getProjects(tree);

  projects.forEach(project => {
    console.log(`Process project ${project.name}`);
    visitAllFiles(tree, project.sourceRoot, (filePath) => {
      const fileEntry = tree.read(filePath);
      const content = fileEntry.toString();

      const newContent = remapImports(project.name, content);

      if (newContent !== content) {
        tree.write(filePath, newContent);
      }
    });
  });
}

export default suiMigratorGenerator;
