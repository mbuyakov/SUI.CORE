import React from "react";
import {wrapInArrayWithoutNulls} from "@sui/core";
import {Collapse} from "antd";
import {IBaseCardCollapseLayout, renderIBaseCardCollapseLayout} from "@/Base/BaseCardCollapseLayout";
import {IBaseCardRowLayout} from "@/Base/BaseCardRow/BaseCardRow";

export interface IBaseCardRowWithCollapseLayout<T, ITEM> {
  collapsePanels: Array<IBaseCardCollapseLayout<T, ITEM>>;
  fitCollapsePanel?: boolean;
}

export const BaseCardRowWithCollapse: <T, ITEM>(props: IBaseCardRowWithCollapseLayout<T, ITEM> & {
  rowIndex: number,
  rowsLength: number,
  sourceItem: T
}) => JSX.Element = props => (
  <Collapse
    style={{
      borderBottom: props.fitCollapsePanel && props.rowIndex === (props.rowsLength - 1) ? 0 : undefined,
      borderLeft: props.fitCollapsePanel ? 0 : undefined,
      borderRight: props.fitCollapsePanel ? 0 : undefined,
      marginBottom: props.fitCollapsePanel && props.rowIndex === (props.rowsLength - 1) ? (-24) : undefined,
      marginLeft: props.fitCollapsePanel ? (-24) : undefined,
      marginRight: props.fitCollapsePanel ? (-24) : undefined,
      marginTop: props.fitCollapsePanel && props.rowIndex === 0 ? (-24) : undefined,
    }}
    defaultActiveKey={wrapInArrayWithoutNulls(props.collapsePanels).filter(panel => panel.defaultOpened).map(panel => panel.title.toString())}
  >
    {wrapInArrayWithoutNulls(props.collapsePanels).map((panel, index) => renderIBaseCardCollapseLayout(props.sourceItem, panel, index, props.fitCollapsePanel || false, props.rowsLength))}
  </Collapse>
);

export function isRowWithCollapse<T, ITEM>(row: IBaseCardRowLayout<T, ITEM>): row is IBaseCardRowWithCollapseLayout<T, ITEM> {
  return "collapsePanels" in row;
}
