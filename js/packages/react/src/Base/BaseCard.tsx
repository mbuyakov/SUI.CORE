import {Card, Tabs} from 'antd';
import autobind from 'autobind-decorator';
import * as React from 'react';
import classNames from 'classnames';
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";

import {BaseCardContext} from '@/Base/BaseCardContext';
import {DEFAULT_ITEM_RENDERER, IBaseCardItemLayout} from '@/Base/BaseCardItemLayout';
import {BaseCardRow, IBaseCardRowLayout, IBaseCardRowWithTabsLayout} from '@/Base/BaseCardRow';
import {BaseCardTabContextConsumer, BaseCardTabContextProvider, IBaseCardTabWithBlocks, isCustomTab, isTabWithBlocks, renderIBaseCardTabLayout} from '@/Base/BaseCardTab';
import {BaseCardBlock, IBaseCardBlockLayout} from "@/Base/BaseCardBlockLayout";
import {BASE_CARD, BASE_CARD_HEADER_ONLY} from "@/styles";
import { ChangedEditModeContext } from '@/ChangedEditModeContext';


const renderTabBar = (): React.ReactElement => <React.Fragment/>;

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
export class BaseCard<T = any, ITEM = IBaseCardItemLayout<T>> extends React.Component<IBaseCardProps<T, ITEM>> {

  public render(): JSX.Element {
    let tabList;
    let tabBarExtraContent;
    let body;
    let firstChildrenIsTab = false;
    let firstTabRouteKey;
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
        firstTabRouteKey = firstRow.tabsRouteKey;
        let firstChildrenTabs = wrapInArrayWithoutNulls(firstRow.tabs);
        hasBlocks = firstChildrenTabs.some(tab => isTabWithBlocks(tab));
        // If any tab has blocks - map all tabs without blocks to tab with 1 block
        if (hasBlocks) {
          firstChildrenTabs = firstChildrenTabs.map(tab => {
            if (!isTabWithBlocks(tab) && !isCustomTab(tab)) {
              (tab as unknown as IBaseCardTabWithBlocks<T, ITEM>).blocks = {
                rows: tab.rows
              };
              delete tab.rows;
            }
            return tab;
          })
        }
        tabList = firstChildrenTabs.map((tab, i) => ({key: i.toString(), tab: (<span>{tab.title}</span>)}));
        tabBarExtraContent = firstRow.tabBarExtraContent;
        // Body = tabs
        body = (
          <BaseCardTabContextConsumer>
            {(baseCardTabContext): JSX.Element => (
              <Tabs style={{padding: hasBlocks ? 0 : 24}} renderTabBar={renderTabBar} activeKey={baseCardTabContext.tab}>
                {firstChildrenTabs.map((tab, tabIndex) => renderIBaseCardTabLayout(this.props.item, tab, tabIndex, this.props.forceRenderTabs))}
              </Tabs>
            )}
          </BaseCardTabContextConsumer>
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

    body = (
      <ChangedEditModeContext.Container>
        {body}
      </ChangedEditModeContext.Container>
    );
    const className = classNames(BASE_CARD, this.props.className);

    // !!! DON'T REASSIGN body VARIABLE AFTER THIS LINE !!!
    let ret;
    if (this.props.noCard) {
      // Body = rows
      ret = (<div className={className}>{body}</div>);
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
        ret = (
          <BaseCardTabContextConsumer>
            {(baseCardTabContext): JSX.Element => (
              <>
                {needTitleCard && <Card
                  title={this.props.cardTitle}
                  tabList={tabList}
                  tabBarExtraContent={tabBarExtraContent}
                  activeTabKey={baseCardTabContext?.tab}
                  defaultActiveTabKey={baseCardTabContext ? undefined : "0"}
                  onTabChange={baseCardTabContext?.setTab}
                  extra={this.props.extra}
                  style={this.props.cardStyle}
                  className={classNames(className, BASE_CARD_HEADER_ONLY)}
                  bodyStyle={firstChildrenIsTab ? {padding: 0} : {}}
                />}
                {body}
              </>
            )}
          </BaseCardTabContextConsumer>
        );
      } else {
        ret = (
          <BaseCardTabContextConsumer>
            {(baseCardTabContext): JSX.Element => (
              <Card
                title={this.props.cardTitle}
                tabList={tabList}
                tabBarExtraContent={tabBarExtraContent}
                activeTabKey={baseCardTabContext?.tab}
                defaultActiveTabKey={baseCardTabContext ? undefined : "0"}
                onTabChange={baseCardTabContext?.setTab}
                extra={this.props.extra}
                style={this.props.cardStyle}
                className={className}
                bodyStyle={firstChildrenIsTab ? {padding: 0} : {}}
              >
                {body}
              </Card>
            )}
          </BaseCardTabContextConsumer>
        );
      }
    }

    if (firstChildrenIsTab) {
      ret = (
        <BaseCardTabContextProvider routeKey={firstTabRouteKey}>
          {ret}
        </BaseCardTabContextProvider>
      );
    }

    return (
      <BaseCardContext.Provider value={{forceRenderTabs: this.props.forceRenderTabs, itemRenderer: this.props.itemRenderer || DEFAULT_ITEM_RENDERER}}>
        {ret}
      </BaseCardContext.Provider>
    );
  }

  @autobind
  private isFirstChildrenIsTab(rows: Array<IBaseCardRowLayout<T, ITEM>>): rows is Array<IBaseCardRowWithTabsLayout<T, ITEM>> {
    return !!(!this.props.noCard && rows.length === 1 && rows[0] && (rows[0] as IBaseCardRowWithTabsLayout<T, ITEM>).tabs);
  }
}
