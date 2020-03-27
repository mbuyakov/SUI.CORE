import { Card } from 'antd';
import Icon from 'antd/lib/icon';
import Tabs from 'antd/lib/tabs';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { BaseCardContext } from './BaseCardContext';
import { DEFAULT_ITEM_RENDERER, IBaseCardItemLayout } from './BaseCardItemLayout';
import { IBaseCardRowLayout, renderIBaseCardRowLayout } from './BaseCardRowLayout';
import { BaseCardTabContext } from './BaseCardTabContext';
import { renderIBaseCardTabLayout } from './BaseCardTabLayout';

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
  // tslint:disable-next-line:no-any
  itemRenderer?(sourceItem: any, item: ITEM, colspan: number): React.ReactNode;
}

// tslint:disable-next-line:no-any
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
    const rows = wrapInArrayWithoutNulls(this.props.rows).filter(row => row);
    let tabList;
    let tabBarExtraContent;
    const firstChildrenIsTab = this.isFirstChildrenIsTab();
    const firstChildrenTabs = wrapInArrayWithoutNulls(rows[0].tabs);
    // Attach tab to card props
    if (firstChildrenIsTab) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      tabList = firstChildrenTabs.map((tab, i) => ({ key: i.toString(), tab: (<span>{tab.icon && <Icon type={tab.icon}/>}{tab.title}</span>) }));
      tabBarExtraContent = rows[0].tabBarExtraContent;
    }
    let body = null;
    // tslint:disable-next-line:prefer-conditional-expression
    if (firstChildrenIsTab) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      body = firstChildrenTabs.map((tab, tabIndex) => renderIBaseCardTabLayout(this.props.item, tab, tabIndex, this.props.forceRenderTabs));
      // this.renderTabPanes(rows[0].tabs)
    } else {
      body = rows.map((row, rowIndex, arr) => renderIBaseCardRowLayout(this.props.item, row, rowIndex, 'card', arr.length, this.isFirstChildrenIsTab()));
    }

    return (
      <BaseCardContext.Provider value={{ forceRenderTabs: this.props.forceRenderTabs, itemRenderer: this.props.itemRenderer || DEFAULT_ITEM_RENDERER}}>
        {this.props.noCard
          ? <>{body}</>
          : (
            <Card
              title={this.props.cardTitle}
              tabList={tabList}
              tabBarExtraContent={tabBarExtraContent}
              defaultActiveTabKey="0"
              onTabChange={this.onTabChange}
              extra={this.props.extra}
              style={this.props.cardStyle}
              className={this.props.className}
              bodyStyle={firstChildrenIsTab ? { padding: 0 } : {}}
            >
              {firstChildrenIsTab
                ? <BaseCardTabContext.Provider value={this.onTabChange}>
                  <Tabs style={{ padding: 24 }} renderTabBar={renderTabBar} activeKey={this.state.tab} tabBarExtraContent={tabBarExtraContent} >
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
  private isFirstChildrenIsTab(): boolean {
    const rows = wrapInArrayWithoutNulls(this.props.rows);

    return !!(!this.props.noCard && rows.length === 1 && rows[0] && rows[0].tabs);
  }

  @autobind
  private onTabChange(key: string): void {
    this.setState({ tab: key });
  }
}
