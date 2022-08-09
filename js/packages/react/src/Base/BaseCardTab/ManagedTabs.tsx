import {Tabs, TabsProps} from "antd";
import * as React from "react";
import {BaseCardTabContextConsumer, BaseCardTabContextProvider} from "@/Base/BaseCardTab/BaseCardTabContext";

type ManagedTabsProps = Omit<TabsProps, 'onChange' | 'activeKey' | 'defaultActiveKey'> & {
  routeKey?: string;
  defaultActiveKey: string;
};

export class ManagedTabs extends React.Component<ManagedTabsProps> {

  public render(): JSX.Element {
    const {routeKey, ...rest} = this.props;
    return (
      <BaseCardTabContextProvider
        routeKey={routeKey}
        defaultTab={rest.defaultActiveKey}
      >
        <BaseCardTabContextConsumer>
          {(baseCardTabContext): JSX.Element => (
            <Tabs
              {...rest}
              activeKey={baseCardTabContext.tab}
              onChange={baseCardTabContext.setTab}
            />
          )}
        </BaseCardTabContextConsumer>
      </BaseCardTabContextProvider>
    );
  }
}

