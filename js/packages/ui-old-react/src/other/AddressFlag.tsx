import {Switch} from "@sui/deps-antd";
import * as React from "react";

export class AddressFlag extends React.Component<{
  disabled?: boolean
  title?: string
}> {
  public render(): JSX.Element {
    return !this.props.disabled && (
      <span>
        <span style={{marginRight: 6}}>{this.props.title}: </span>
        <Switch
          {...this.props}
          // Don't drop
          style={{}}
        />
      </span>
    );
  }
}
