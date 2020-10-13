import {Card} from 'antd';
import Tabs from 'antd/lib/tabs';
import autobind from 'autobind-decorator';
import * as React from 'react';
import classNames from 'classnames';
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";

import {BaseCardContext} from '@/Base/BaseCardContext';
import {DEFAULT_ITEM_RENDERER, IBaseCardItemLayout} from '@/Base/BaseCardItemLayout';
import {BaseCardRow, IBaseCardRowLayout, IBaseCardRowWithTabsLayout} from '@/Base/BaseCardRow';
import {BaseCardTabContext} from '@/Base/BaseCardTabContext';
import {renderIBaseCardTabLayout} from '@/Base/BaseCardTabLayout';


const renderTabBar = () => <React.Fragment/>;

export interface IBaseCardProps<T, ITEM> {
  cardStyle?: React.CSSProperties;
  cardTitle?: JSX.Element | string; // only for noCard: false
  className?: string; // only for noCard: false
  extra?: string | JSX.Element;
  forceRenderTabs?: boolean;
  item?: T;
  noCard?: boolean; // Paradox mode
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;

  itemRenderer?(sourceItem: T, item: ITEM, colspan: number): React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BaseCard<T = any, ITEM = IBaseCardItemLayout<T>> extends React.Component<IBaseCardProps<T, ITEM>, {
  tab: string
}> {

  public constructor(props: IBaseCardProps<T, ITEM>) {
    super(props);
    this.state = {
      tab: '0',
    };
  }

  public render(): JSX.Element {
    const rows = wrapInArrayWithoutNulls(this.props.rows);
    let tabList;
    let tabBarExtraContent;
    let body = null;
    let firstChildrenIsTab = false;
    // Attach tab to card props
    if (this.isFirstChildrenIsTab(rows)) {
      firstChildrenIsTab = true;
      const firstRow = rows[0];
      const firstChildrenTabs = wrapInArrayWithoutNulls(firstRow.tabs);
      tabList = firstChildrenTabs.map((tab, i) => ({key: i.toString(), tab: (<span>{tab.title}</span>)}));
      tabBarExtraContent = firstRow.tabBarExtraContent;
      body = firstChildrenTabs.map((tab, tabIndex) => renderIBaseCardTabLayout(this.props.item, tab, tabIndex, this.props.forceRenderTabs));
    } else {
      body = rows.map((row, rowIndex, arr) => (
        <BaseCardRow
          sourceItem={this.props.item}
          row={row}
          rowIndex={rowIndex}
          parent="card"
          rowsLength={arr.length}
        />
      ));
    }

    const className = classNames("baseCard", this.props.className);
    return (
      <BaseCardContext.Provider value={{forceRenderTabs: this.props.forceRenderTabs, itemRenderer: this.props.itemRenderer || DEFAULT_ITEM_RENDERER}}>
        {this.props.noCard
          ? <div className={className}>{body}</div>
          : (
            <Card
              title={this.props.cardTitle}
              tabList={tabList}
              tabBarExtraContent={tabBarExtraContent}
              defaultActiveTabKey="0"
              onTabChange={this.onTabChange}
              extra={this.props.extra}
              style={this.props.cardStyle}
              className={className}
              bodyStyle={firstChildrenIsTab ? {padding: 0} : {}}
            >
              {firstChildrenIsTab
                ? <BaseCardTabContext.Provider value={this.onTabChange}>
                  <Tabs style={{padding: 24}} renderTabBar={renderTabBar} activeKey={this.state.tab} tabBarExtraContent={tabBarExtraContent}>
                    {body}
                  </Tabs>
                </BaseCardTabContext.Provider>
                : body}
            </Card>
          )}
      </BaseCardContext.Provider>
    );
  }

  @autobind
  private isFirstChildrenIsTab(rows: Array<IBaseCardRowLayout<T, ITEM>>): rows is Array<IBaseCardRowWithTabsLayout<T, ITEM>> {
    return !!(!this.props.noCard && rows.length === 1 && rows[0] && (rows[0] as IBaseCardRowWithTabsLayout<T, ITEM>).tabs);
  }

  @autobind
  private onTabChange(key: string): void {
    this.setState({tab: key});
  }
}
