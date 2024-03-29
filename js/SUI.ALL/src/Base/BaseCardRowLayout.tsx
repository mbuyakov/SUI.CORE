import Collapse from 'antd/lib/collapse';
import Divider from 'antd/lib/divider';
import * as React from 'react';

import { BackendTable } from '../BackendTable';
import { getDataByKey } from '../dataKey';
import { addQuotesIfString } from '../stringFormatters';
import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { BaseCard } from './BaseCard';
import { IBaseCardCollapseLayout, renderIBaseCardCollapseLayout } from './BaseCardCollapseLayout';
import { IBaseCardColLayout, renderIBaseCardColsLayout } from './BaseCardColLayout';
import { BaseCardContext } from './BaseCardContext';
import { IBaseCardTabLayout, ManagedTabs, renderIBaseCardTabLayout } from './BaseCardTabLayout';

// It's BACKEND props. Mark as MetaTableProps for backward computability in RN
export interface IMetaTableProps {
  filter?: object | string;
  globalFilter?: object | string;
  table: string;
  titleEnabled?: boolean;
}

export interface IBaseCardRowLayout<T, ITEM> {
  collapsePanels?: Array<IBaseCardCollapseLayout<T, ITEM>>;
  cols?: OneOrArrayWithNulls<IBaseCardColLayout<T, ITEM>>;
  dividerDashed?: boolean;
  dividerText?: string;
  fitCollapsePanel?: boolean;
  isDivider?: boolean;
  metaTableProps?: IMetaTableProps;
  style?: React.CSSProperties;
  tabBarExtraContent?: React.ReactNode;
  tabs?: OneOrArrayWithNulls<IBaseCardTabLayout<T, ITEM>>;
  tabsInCard?: boolean;
}

export const DATA_KEY_REGEXP = /@([a-zA-z0-9\|]+)/g;

export function mapFilters(filters: string, sourceItem: any): string | null {
  let result = filters;

  // noinspection SuspiciousTypeOfGuard
  if (typeof result === 'string') {
    result = result.replace(DATA_KEY_REGEXP, (_, key) => {
      const dataKey = key.split('|');
      let data = getDataByKey(sourceItem, dataKey);
      if (Array.isArray(data)) {
        data = data.map(addQuotesIfString);
      }

      return addQuotesIfString(data);
    });

    result = result.replace(/([A-Za-z0-9]+)\s*:/g, (_, key) => `"${key.trim()}":`);
  }

  return result || null;
}

// @ts-ignore
export function renderIBaseCardRowLayout<T, ITEM>(sourceItem: any, row: IBaseCardRowLayout<T, ITEM>, rowIndex: number, parent: 'card' | 'collapse' | 'tab', rowsLength: number, firstChildrenIsTab: boolean = false): JSX.Element {
  if (row.isDivider) {
    return (
      <Divider
        orientation="left"
        dashed={row.dividerDashed}
      >
        {row.dividerText}
      </Divider>
    );
  }

  if (row.tabs) {
    return (
      row.tabsInCard
        ? (
          <BaseCard
            rows={{
              tabs: row.tabs,
            }}
            item={sourceItem}
          />
        )
        : (
          <BaseCardContext.Consumer>
            {({ forceRenderTabs }): JSX.Element => (
              <ManagedTabs defaultActiveKey="0">
                {wrapInArrayWithoutNulls(row.tabs).map((tab, index) => renderIBaseCardTabLayout(sourceItem, tab, index, forceRenderTabs))}
              </ManagedTabs>
            )}
          </BaseCardContext.Consumer>
        )
    );
  }

  if (row.metaTableProps) {
    // console.log(
    //   row.metaTableProps.filter as string, `|${mapFilters(row.metaTableProps.filter as string, sourceItem)}|`,
    //   row.metaTableProps.globalFilter, `|${mapFilters(row.metaTableProps.globalFilter as string, sourceItem)}|`
    // );

    console.log(sourceItem);

    return (
      <BackendTable
        cardType="inner"
        {...row.metaTableProps}
        paperStyle={rowIndex !== 0 || rowsLength !== 1 ? { marginLeft: 0, marginRight: 0 } : {}}
        fitToCardBody={(parent === 'card' || (parent === 'tab' && firstChildrenIsTab)) && rowIndex === 0 && rowsLength === 1}
        fitToCollapseBody={parent === 'collapse' && rowIndex === 0 && rowsLength === 1}
        filter={JSON.parse(mapFilters(row.metaTableProps.globalFilter as string, sourceItem))}
        defaultFilter={JSON.parse(mapFilters(row.metaTableProps.filter as string, sourceItem))}
      />
    );
  }

  if (row.collapsePanels) {
    return (
      <Collapse
        style={{
          borderBottom: row.fitCollapsePanel && rowIndex === (rowsLength - 1) ? 0 : undefined,
          borderLeft: row.fitCollapsePanel ? 0 : undefined,
          borderRight: row.fitCollapsePanel ? 0 : undefined,
marginBottom: row.fitCollapsePanel && rowIndex === (rowsLength - 1) ? (-24) : undefined,
marginLeft: row.fitCollapsePanel ? (-24) : undefined,
marginRight: row.fitCollapsePanel ? (-24) : undefined,
marginTop: row.fitCollapsePanel && rowIndex === 0 ? (-24) : undefined,
        }}
        defaultActiveKey={wrapInArrayWithoutNulls(row.collapsePanels).map((panel, index) => ({ defaultOpened: panel.defaultOpened, index })).filter(panel => panel.defaultOpened).map(panel => panel.index.toString())}
      >
        {wrapInArrayWithoutNulls(row.collapsePanels).map((panel, index) => renderIBaseCardCollapseLayout(sourceItem, panel, index, row.fitCollapsePanel || false, rowsLength))}
      </Collapse>
    );
  }

  if (row.cols) {
    const cols = wrapInArrayWithoutNulls(row.cols);

    return renderIBaseCardColsLayout(sourceItem, cols);
  }

return (<h3>UNKNOWN ROW TYPE</h3>);
}
