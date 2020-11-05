import React from "react";
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";
import {BaseCard} from "@/Base/BaseCard";
import {BaseCardContext} from "@/Base/BaseCardContext";
import {IBaseCardTabLayout, renderIBaseCardTabLayout} from "@/Base/BaseCardTab";
import {IBaseCardRowLayout} from "@/Base/BaseCardRow/BaseCardRow";
import {ManagedTabs} from "@/Base/BaseCardTab/ManagedTabs";

export interface IBaseCardRowWithTabsLayout<T, ITEM> {
  tabBarExtraContent?: React.ReactNode;
  tabsRouteKey?: string;
  tabs: OneOrArrayWithNulls<IBaseCardTabLayout<T, ITEM>>;
  tabsInCard?: boolean;
}

export const BaseCardRowWithTabs: <T, ITEM>(props: IBaseCardRowWithTabsLayout<T, ITEM> & {
  sourceItem: T
}) => JSX.Element = props => {
  const tabs = wrapInArrayWithoutNulls(props.tabs);
  return (
    props.tabsInCard
      ? (
        <BaseCard
          rows={{
            tabs,
          }}
          item={props.sourceItem}
        />
      )
      : (
        <BaseCardContext.Consumer>
          {({forceRenderTabs}): JSX.Element => (
            <ManagedTabs routeKey={props.tabsRouteKey}>
              {tabs.map((tab, index) => renderIBaseCardTabLayout(props.sourceItem, tab, index, forceRenderTabs))}
            </ManagedTabs>
          )}
        </BaseCardContext.Consumer>
      )
  );
}

export function isRowWithTabs<T, ITEM>(row: IBaseCardRowLayout<T, ITEM>): row is IBaseCardRowWithTabsLayout<T, ITEM> {
  return "tabs" in row;
}
