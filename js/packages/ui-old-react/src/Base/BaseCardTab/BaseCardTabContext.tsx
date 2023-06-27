import * as React from 'react';
import {generatePath, match, RouteComponentProps, withRouter} from "react-router-dom";
import autobind from 'autobind-decorator';
import {ReactInstance} from "react";

const BaseCardTabContext = React.createContext<{ setTab(tab: string): void, tab: string }>(null);

type BaseCardTabContextProps = RouteComponentProps & {
  children: React.ReactNode;
  routeKey?: string;
  defaultTab: string;
};

class BaseCardTabContextProviderInner extends React.Component<BaseCardTabContextProps, {
  tab: string;
}> {
  public constructor(props: BaseCardTabContextProps) {
    super(props);
    let tab = this.props.defaultTab;
    if (props.routeKey) {
      // Backward compatibility
      if (props.match.params[props.routeKey] == null || props.match.params[props.routeKey] == `:${props.routeKey}`) {
        props.match.params[props.routeKey] = tab;
        props.history.replace(generatePath(props.match.path, props.match.params));
      } else {
        tab = props.match.params[props.routeKey];
      }
    }

    this.state = {
      tab
    };
  }

  public render(): JSX.Element {
    return (
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      <BaseCardTabContext.Provider value={{setTab: this.setTab, tab: this.state.tab}}>
        {this.props.children}
      </BaseCardTabContext.Provider>
    );
  }

  @autobind
  public setTab(tab: string): void {
    if (tab == `:${this.props.routeKey}`) {
      tab = this.props.defaultTab;
    }
    this.setState({tab});
    if (this.props.routeKey) {
      this.props.match.params[this.props.routeKey] = tab;
      this.props.history.replace(generatePath(this.props.match.path, this.props.match.params));
    }
  }

  public componentDidUpdate(): void {
    if (this.props.routeKey && this.props.match.params[this.props.routeKey] != this.state.tab) {
      this.setTab(this.props.match.params[this.props.routeKey]);
    }
  }
}

export const BaseCardTabContextProvider: React.ComponentClass<Omit<BaseCardTabContextProps, 'history' | 'location' | 'match'>> = withRouter(BaseCardTabContextProviderInner);
export const BaseCardTabContextConsumer = BaseCardTabContext.Consumer;