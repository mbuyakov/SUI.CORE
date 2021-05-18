import {Toolbar} from "@material-ui/core";
import {ToolbarProps} from "@material-ui/core/Toolbar";
import * as React from "react";

export function ToolbarBase<T extends ToolbarProps>(children: React.ReactNode) : (props: T) => JSX.Element {
  return (...props): JSX.Element => (
    <Toolbar {...props}>
      {[children, props[0].children]}
    </Toolbar>
  );
}
