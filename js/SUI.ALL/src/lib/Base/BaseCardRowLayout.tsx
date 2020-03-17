import { Descriptions } from 'antd';
import Collapse from 'antd/lib/collapse';
import Divider from 'antd/lib/divider';
import * as React from 'react';

import { BackendTable } from '../BackendTable';
import { getDataByKey } from '../dataKey';
import { addQuotesIfString } from '../stringFormatters';
import { BASE_CARD_ITEM, BASE_CARD_ROW, BASE_CARD_ROWS, BASE_FORM_ITEM } from '../styles';
import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { BaseCard } from './BaseCard';
import { IBaseCardCollapseLayout, renderIBaseCardCollapseLayout } from './BaseCardCollapseLayout';
import { IBaseCardColLayout, IBaseFormColLayout } from './BaseCardColLayout';
import { BaseCardContext } from './BaseCardContext';
import { IBaseCardDescItemLayout, IBaseCardItemLayout, renderIBaseCardItem } from './BaseCardItemLayout';
import { IBaseCardTabLayout, IBaseFormTabLayout, ManagedTabs, renderIBaseCardTabLayout } from './BaseCardTabLayout';
import { IBaseFormDescItemLayout, IBaseFormItemLayout, renderIBaseFormItemLayout } from './BaseFormItemLayout';

// It's BACKEND props. Mark as MetaTableProps for backward computability in RN
export interface IMetaTableProps {
  filter?: object | string;
  globalFilter?: object | string;
  table: string;
  titleEnabled?: boolean;
}

export interface IBaseCardRowLayout<T> {
  collapsePanels?: Array<IBaseCardCollapseLayout<T>>;
  cols?: OneOrArrayWithNulls<IBaseCardColLayout<T>>;
  descriptionItems?: OneOrArrayWithNulls<IBaseCardDescItemLayout<T>>;
  dividerDashed?: boolean;
  dividerText?: string;
  fitCollapsePanel?: boolean;
  isDivider?: boolean;
  metaTableProps?: IMetaTableProps;
  style?: React.CSSProperties;
  tabBarExtraContent?: React.ReactNode;
  tabs?: OneOrArrayWithNulls<IBaseCardTabLayout<T>>;
  tabsInCard?: boolean;
}

export type IBaseFormRowLayout<T> = Omit<IBaseCardRowLayout<T>, 'cols' | 'descriptionItems' | 'tabs'> & {
  cols?: OneOrArrayWithNulls<IBaseFormColLayout<T>>
  descriptionItems?: OneOrArrayWithNulls<IBaseFormDescItemLayout>
  tabs?: OneOrArrayWithNulls<IBaseFormTabLayout<T>>
}

export const DATA_KEY_REGEXP = /@([a-zA-z0-9\|]+)/g;

// tslint:disable-next-line:no-any
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

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
// tslint:disable-next-line:cyclomatic-complexity no-any
export function renderIBaseCardRowLayout<T>(sourceItem: any, row: IBaseCardRowLayout<T> | IBaseFormRowLayout<T>, rowIndex: number, parent: 'card' | 'collapse' | 'tab', rowsLength: number, firstChildrenIsTab: boolean = false): JSX.Element {
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
                {wrapInArrayWithoutNulls(row.tabs as OneOrArrayWithNulls<IBaseCardTabLayout<T> | IBaseFormTabLayout<T>>).map((tab, index) => renderIBaseCardTabLayout(sourceItem, tab, index, forceRenderTabs))}
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
          // tslint:disable-next-line:no-magic-numbers
          marginBottom: row.fitCollapsePanel && rowIndex === (rowsLength - 1) ? (-24) : undefined,
          // tslint:disable-next-line:no-magic-numbers
          marginLeft: row.fitCollapsePanel ? (-24) : undefined,
          // tslint:disable-next-line:no-magic-numbers
          marginRight: row.fitCollapsePanel ? (-24) : undefined,
          // tslint:disable-next-line:no-magic-numbers
          marginTop: row.fitCollapsePanel && rowIndex === 0 ? (-24) : undefined,
        }}
        defaultActiveKey={wrapInArrayWithoutNulls(row.collapsePanels).map((panel, index) => ({defaultOpened: panel.defaultOpened, index})).filter(panel => panel.defaultOpened).map(panel => panel.index.toString())}
      >
        {wrapInArrayWithoutNulls(row.collapsePanels).map((panel, index) => renderIBaseCardCollapseLayout(sourceItem, panel, index, row.fitCollapsePanel || false, rowsLength))}
      </Collapse>
    );
  }

  if (row.cols) {
    // return (
    //   <Row style={row.style}>
    //     {wrapInArrayWithoutNulls(row.cols).map((col, _, arr) => renderIBaseCardColLayout(sourceItem, col, arr.length))}
    //   </Row>
    // );
    const rows: JSX.Element[] = [];

    const cols = wrapInArrayWithoutNulls<IBaseCardColLayout<T> | IBaseFormColLayout<T>>(row.cols);
    // tslint:disable-next-line:no-any
    const maxRows = Math.max(...cols.map(col => wrapInArrayWithoutNulls<any>(col.items).length));

    for (let curRowIndex = 0; curRowIndex < maxRows; curRowIndex++) {
      const itemsInRow: JSX.Element[] = [];

      // tslint:disable-next-line:prefer-for-of
      for (let colIndex = 0; colIndex < cols.length; colIndex++) {
        const col = cols[colIndex];
        const item = wrapInArrayWithoutNulls<IBaseCardItemLayout<T> | IBaseFormItemLayout>(col.items)[curRowIndex];
        // console.log(cols, item);
        itemsInRow.push(
          <div className={(item && (item as IBaseFormItemLayout).fieldName) ? BASE_FORM_ITEM : BASE_CARD_ITEM}>
            {item && ((item as IBaseFormItemLayout).fieldName ? renderIBaseFormItemLayout(item as IBaseFormItemLayout) : renderIBaseCardItem(sourceItem, item))}
          </div>,
        );
      }

      rows.push(
        <div className={BASE_CARD_ROW}>
          {itemsInRow}
        </div>,
      );
    }

    return (
      <div className={BASE_CARD_ROWS}>
        {rows}
      </div>
    );
  }

  if (row.descriptionItems) {
    // console.log(row.descriptionItems);
    return (
      <Descriptions
        size="small"
      >
        {wrapInArrayWithoutNulls<IBaseCardItemLayout<T> | IBaseFormItemLayout>(row.descriptionItems).map(descItem => (descItem as IBaseFormItemLayout).fieldName ? renderIBaseFormItemLayout(descItem as IBaseFormItemLayout) : renderIBaseCardItem(sourceItem, descItem as IBaseCardItemLayout<T>))}
      </Descriptions>
    );
  }

  // tslint:disable-next-line:jsx-key
  return (<h3>UNKNOWN ROW TYPE</h3>);
}
