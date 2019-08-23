// import MetaTable, { IMetaTableProps } from '@/Meta/MetaTable';
import { Omit, OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '@smsoft/sui-core';
import { Descriptions } from 'antd';
import Collapse from 'antd/lib/collapse';
import Divider from 'antd/lib/divider';
import Tabs from 'antd/lib/tabs';
import * as React from 'react';

import { BASE_CARD_ITEM, BASE_CARD_ROW, BASE_CARD_ROWS, BASE_FORM_ITEM } from '../styles';

import { BaseCard } from './BaseCard';
import { IBaseCardCollapseLayout, renderIBaseCardCollapseLayout } from './BaseCardCollapseLayout';
import { IBaseCardColLayout, IBaseFormColLayout } from './BaseCardColLayout';
import { BaseCardContext } from './BaseCardContext';
import { IBaseCardDescItemLayout, IBaseCardItemLayout, renderIBaseCardItem } from './BaseCardItemLayout';
import { IBaseCardTabLayout, IBaseFormTabLayout, renderIBaseCardTabLayout } from './BaseCardTabLayout';
import { IBaseFormDescItemLayout, IBaseFormItemLayout, renderIBaseFormItemLayout } from './BaseFormItemLayout';

export interface IBaseCardRowLayout<T> {
  collapsePanels?: Array<IBaseCardCollapseLayout<T>>;
  cols?: OneOrArrayWithNulls<IBaseCardColLayout<T>>;
  descriptionItems?: OneOrArrayWithNulls<IBaseCardDescItemLayout<T>>;
  dividerDashed?: boolean;
  dividerText?: string;
  fitCollapsePanel?: boolean;
  isDivider?: boolean;
  // metaTableProps?: IMetaTableProps;
  style?: React.CSSProperties;
  tabs?: Array<IBaseCardTabLayout<T>>;
  tabsInCard?: boolean;
}

export type IBaseFormRowLayout<T> = Omit<IBaseCardRowLayout<T>, 'cols' | 'descriptionItems' | 'tabs'> & {
  cols?: OneOrArrayWithNulls<IBaseFormColLayout<T>>
  descriptionItems?: OneOrArrayWithNulls<IBaseFormDescItemLayout<T>>
  tabs?: Array<IBaseFormTabLayout<T>>
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
            {({ forceRenderTabs }) => (
              <Tabs defaultActiveKey="0">
                {(row.tabs as Array<IBaseCardTabLayout<T>>).map((tab, index) => renderIBaseCardTabLayout(sourceItem, tab, index, forceRenderTabs))}
              </Tabs>
            )}
          </BaseCardContext.Consumer>
        )
    );
  }

  // if (row.metaTableProps) {
  //   let filter = row.metaTableProps.filter;
  //   if (typeof filter === 'string') {
  //     filter = filter.replace(DATA_KEY_REGEXP, (_, key) => {
  //       const dataKey = key.split('|');
  //       let data = getDataByKey(sourceItem, dataKey);
  //       // // console.log(data);
  //       if (Array.isArray(data)) {
  //         data = data.map(addQuotesIfString);
  //       }
  //       return addQuotesIfString(data);
  //     });
  //   }
  //   return (
  //     <MetaTable
  //       cardType="inner"
  //       {...row.metaTableProps}
  //       paperStyle={rowIndex !== 0 || rowsLength !== 1 ? { marginLeft: 0, marginRight: 0 } : {}}
  //       fitToCardBody={(parent === 'card' || (parent === 'tab' && firstChildrenIsTab)) && rowIndex === 0 && rowsLength === 1}
  //       fitToCollapseBody={parent === 'collapse' && rowIndex === 0 && rowsLength === 1}
  //       filter={filter}
  //     />
  //   );
  // }

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
        defaultActiveKey={row.collapsePanels.filter(panel => panel.defaultOpened).map((_, index) => index.toString())}
      >
        {row.collapsePanels.map((panel, index) => renderIBaseCardCollapseLayout(sourceItem, panel, index, row.fitCollapsePanel || false, rowsLength))}
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
        const item = wrapInArrayWithoutNulls(col.items)[curRowIndex];
        // console.log(cols, item);
        itemsInRow.push(
          <div className={(item && (item as IBaseFormItemLayout<T>).fieldName) ? BASE_FORM_ITEM : BASE_CARD_ITEM}>
            {item && ((item as IBaseFormItemLayout<T>).fieldName ? renderIBaseFormItemLayout(item as IBaseFormItemLayout<T>) : renderIBaseCardItem(sourceItem, item))}
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
        {wrapInArrayWithoutNulls<IBaseCardItemLayout<T> | IBaseFormItemLayout<T>>(row.descriptionItems).map(descItem => (descItem as IBaseFormItemLayout<T>).fieldName ? renderIBaseFormItemLayout(descItem as IBaseFormItemLayout<T>) : renderIBaseCardItem(sourceItem, descItem as IBaseCardItemLayout<T>))}
      </Descriptions>
    );
  }

  // tslint:disable-next-line:jsx-key
  return (<h3>UNKNOWN ROW TYPE</h3>);
}
