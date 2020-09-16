import React from "react";

import {PrintModeContext} from "./PrintModeContext";

export class Unprintable extends React.Component {
  public render(): React.ReactNode {
    return (
      <PrintModeContext.Consumer>
        {printMode => printMode ? undefined : this.props.children}
      </PrintModeContext.Consumer>
    );
  }
}
