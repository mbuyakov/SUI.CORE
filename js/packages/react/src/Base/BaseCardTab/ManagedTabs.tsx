import {Tabs} from "antd";
import {TabsProps} from "antd/es/tabs";
import * as React from "react";
import {BaseCardTabContextConsumer, BaseCardTabContextProvider} from "@/Base/BaseCardTab/BaseCardTabContext";

type ManagedTabsProps = Omit<TabsProps, 'onChange' | 'activeKey'> & {
  routeKey?: string;
};

export class ManagedTabs extends React.Component<ManagedTabsProps> {

  public render(): JSX.Element {
    const {routeKey, ...rest} = this.props;
    return (
      <BaseCardTabContextProvider routeKey={routeKey}>
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

