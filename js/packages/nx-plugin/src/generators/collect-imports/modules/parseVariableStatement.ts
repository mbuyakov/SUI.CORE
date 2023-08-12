import { VariableStatement} from "typescript";

export function parseVariableStatement(node: VariableStatement) {
  return node.declarationList.declarations.map(it => it.name.getText());
}
