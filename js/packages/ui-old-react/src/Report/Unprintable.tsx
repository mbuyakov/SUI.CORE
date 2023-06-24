import React from "react";

import {PrintModeContext} from "./PrintModeContext";

export class Unprintable extends React.Component<{
  children: React.ReactNode
}> {
  public render(): React.ReactNode {
    return (
      <PrintModeContext.Consumer>
        {(printMode): React.ReactNode | undefined => printMode ? undefined : this.props.children}
      </PrintModeContext.Consumer>
    );
  }
}
