import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/ui-old-core";
import {IBaseCardColLayout, renderIBaseCardColsLayout} from "@/Base/BaseCardColLayout";
import {IBaseCardRowLayout} from "@/Base/BaseCardRow/BaseCardRow";

export interface IBaseCardRowWithColsLayout<T, ITEM> {
  cols: OneOrArrayWithNulls<IBaseCardColLayout<T, ITEM>>;
}

export const BaseCardRowWithCols: <T, ITEM>(props: IBaseCardRowWithColsLayout<T, ITEM> & {
  sourceItem: T
}) => JSX.Element = props => (
  renderIBaseCardColsLayout(props.sourceItem, wrapInArrayWithoutNulls(props.cols))
);

export function isRowWithCols<T, ITEM>(row: IBaseCardRowLayout<T, ITEM>): row is IBaseCardRowWithColsLayout<T, ITEM> {
  return "cols" in row;
}
