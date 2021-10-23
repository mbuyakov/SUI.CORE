import {Nullable} from "@sui/core";
import {Tooltip} from "@material-ui/core";
import React from "react";

export const tooltipWrapper = (tooltip: Nullable<string>, component: JSX.Element): JSX.Element => {
  // Div required for tooltip on disabled button
  component = (
    <div>
      {component}
    </div>
  );

  if (tooltip) {
    component = (
      <Tooltip title={tooltip}>
        {component}
      </Tooltip>
    );
  }

  return component;
}
