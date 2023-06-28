import React from "react";
import {Box, Tooltip} from "@sui/deps-material";

export interface TooltipWrapperProps {
  title?: string
  children: React.ReactElement
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({title, children}) => {
  // Span required for tooltip on disabled button
  let result = (<span>{children}</span>);

  if (title) {
    result = (
      <Tooltip
        title={title}
        arrow={true}
      >
        {result}
      </Tooltip>
    );
  }

  return result;
};
