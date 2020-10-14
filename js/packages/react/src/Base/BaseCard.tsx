import {Card} from 'antd';
import Tabs from 'antd/lib/tabs';
import autobind from 'autobind-decorator';
import * as React from 'react';
import classNames from 'classnames';
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";

import {BaseCardContext} from '@/Base/BaseCardContext';
import {DEFAULT_ITEM_RENDERER, IBaseCardItemLayout} from '@/Base/BaseCardItemLayout';
import {BaseCardRow, IBaseCardRowLayout, IBaseCardRowWithTabsLayout} from '@/Base/BaseCardRow';
import {BaseCardTabContext, IBaseCardTabLayout, IBaseCardTabWithBlocks, isTabWithBlocks, renderIBaseCardTabLayout} from '@/Base/BaseCardTab';
import {BaseCardBlock, IBaseCardBlockLayout} from "@/Base/BaseCardBlockLayout";


const renderTabBar = () => <React.Fragment/>;

export interface IBaseCardProps<T, ITEM> {
  cardStyle?: React.CSSProperties;
  cardTitle?: JSX.Element | string; // only for noCard: false
  className?: string; // only for noCard: false
  extra?: string | JSX.Element;
  forceRenderTabs?: boolean;
  item?: T;
  noCard?: boolean; // Paradox mode
  rows?: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  blocks?: OneOrArrayWithNulls<IBaseCardBlockLayout<T, ITEM>>;

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
    let tabList;
    let tabBarExtraContent;
    let body;
    let firstChildrenIsTab = false;
    let hasBlocks = !!this.props.blocks; // BaseCard props OR any tab have blocks
    // If has parent blocks - disable custom tab logic
    if (hasBlocks) {
      const blocks = wrapInArrayWithoutNulls(this.props.blocks);
      body = blocks.map((block, rowIndex) => (
        <BaseCardBlock
          {...block}
          key={rowIndex.toString()}
          sourceItem={this.props.item}
        />
      ));
    } else {
      const rows = wrapInArrayWithoutNulls(this.props.rows);
      // Attach tabBar to parent card if first row has tabs
      if (this.isFirstChildrenIsTab(rows)) {
        firstChildrenIsTab = true;
        const firstRow = rows[0];
        let firstChildrenTabs = wrapInArrayWithoutNulls(firstRow.tabs);
        hasBlocks = firstChildrenTabs.some(tab => isTabWithBlocks(tab));
        // If any tab has blocks - map all tabs without blocks to tab with 1 block
        firstChildrenTabs = firstChildrenTabs.map(tab => {
          if(!isTabWithBlocks(tab)) {
            (tab as unknown as IBaseCardTabWithBlocks<T, ITEM>).blocks = {
              rows: tab.rows
            };
            delete tab.rows;
          }
          return tab;
        })
        tabList = firstChildrenTabs.map((tab, i) => ({key: i.toString(), tab: (<span>{tab.title}</span>)}));
        tabBarExtraContent = firstRow.tabBarExtraContent;
        // Body = tabs
        body = (
          <BaseCardTabContext.Provider value={this.onTabChange}>
            <Tabs style={{padding: hasBlocks ? 0 : 24}} renderTabBar={renderTabBar} activeKey={this.state.tab}>
              {firstChildrenTabs.map((tab, tabIndex) => renderIBaseCardTabLayout(this.props.item, tab, tabIndex, this.props.forceRenderTabs))}
            </Tabs>
          </BaseCardTabContext.Provider>
        );
      } else {
        // Body = rows
        body = rows.map((row, rowIndex, arr) => (
          <BaseCardRow
            key={rowIndex.toString()}
            sourceItem={this.props.item}
            row={row}
            rowIndex={rowIndex}
            parent="card"
            rowsLength={arr.length}
          />
        ));
      }
    }

    const className = classNames("baseCard", this.props.className);
    if (this.props.noCard) {
      // Body = rows
      body = (<div className={className}>{body}</div>);
    } else {
      // If has blocks in BaseCard props OR any tab have blocks
      if (hasBlocks) {
        // If has blocks in BaseCard props and some props mapped to Card - add "title" card
        // If has only blocks in BaseCard props - show blocks without "title" card
        const needTitleCard =
          firstChildrenIsTab ||
          this.props.extra ||
          this.props.cardStyle ||
          this.props.className;
        body = (
          <>
            {needTitleCard && <Card
              title={this.props.cardTitle}
              tabList={tabList}
              tabBarExtraContent={tabBarExtraContent}
              defaultActiveTabKey="0"
              onTabChange={this.onTabChange}
              extra={this.props.extra}
              style={this.props.cardStyle}
              className={className}
              bodyStyle={firstChildrenIsTab ? {padding: 0} : {}}
            />}
            {body}
          </>
        );
      } else {
        body = (
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
            {body}
          </Card>
        );
      }
    }

    return (
      <BaseCardContext.Provider value={{forceRenderTabs: this.props.forceRenderTabs, itemRenderer: this.props.itemRenderer || DEFAULT_ITEM_RENDERER}}>
        {body}
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
