import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '@smsoft/sui-core';
import { Card } from 'antd';
import Icon from 'antd/lib/icon';
import Tabs from 'antd/lib/tabs';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { IBaseCardRowLayout, renderIBaseCardRowLayout } from './BaseCardRowLayout';
import { renderIBaseCardTabLayout } from './BaseCardTabLayout';

const renderTabBar = () => <React.Fragment/>;

export interface IBaseCardProps<T> {
  cardStyle?: React.CSSProperties;
  cardTitle?: JSX.Element | string; // only for noCard: false
  extra?: string | JSX.Element;
  item?: T;
  noCard?: boolean; // Paradox mode
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T>>;
}

export class BaseCard<T> extends React.Component<IBaseCardProps<T>, {
  tab: string
}> {

  public constructor(props: IBaseCardProps<T>) {
    super(props);
    this.state = {
      tab: '0',
    };
  }

  public render(): JSX.Element {
    const rows = wrapInArrayWithoutNulls(this.props.rows).filter(row => row);
    let tabList;
    const firstChildrenIsTab = this.isFirstChildrenIsTab();
    // Attach tab to card props
    if (firstChildrenIsTab) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      tabList = rows[0].tabs.map((tab, i) => ({ key: i.toString(), tab: (<span>{tab.icon && <Icon type={tab.icon}/>}{tab.title}</span>) }));
    }
    let body = null;
    // tslint:disable-next-line:prefer-conditional-expression
    if (firstChildrenIsTab) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      body = rows[0].tabs.map((tab, tabIndex) => renderIBaseCardTabLayout(this.props.item, tab, tabIndex));
      // this.renderTabPanes(rows[0].tabs)
    } else {
      body = rows.map((row, rowIndex, arr) => renderIBaseCardRowLayout(this.props.item, row, rowIndex, 'card', arr.length, this.isFirstChildrenIsTab()));
    }

    return (
      this.props.noCard
        ? <>{body}</>
        : (
          <Card
            title={this.props.cardTitle}
            tabList={tabList}
            defaultActiveTabKey="0"
            onTabChange={this.onTabChange}
            extra={this.props.extra}
            style={this.props.cardStyle}
            bodyStyle={firstChildrenIsTab ? { padding: 0 } : {}}
          >
            {firstChildrenIsTab
              ? <Tabs style={{ padding: 24 }} renderTabBar={renderTabBar} activeKey={this.state.tab}>
                {body}
              </Tabs>
              : body}
          </Card>
        )
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