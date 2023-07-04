// Migrated to @sui/ui-material

import {Tooltip} from "@mui/material";
import React from "react";
import {Nullable} from "@sui/util-types";

export const tooltipWrapper = (tooltip: Nullable<string>, component: JSX.Element): JSX.Element => {
  // Div required for tooltip on disabled button
  component = (
    <div>
      {component}
    </div>
  );

  if (tooltip) {
    component = (
      <Tooltip
        title={tooltip}
        arrow={true}
      >
        {component}
      </Tooltip>
    );
  }

  return component;
};
