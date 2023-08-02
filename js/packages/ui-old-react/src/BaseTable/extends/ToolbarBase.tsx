import {Toolbar, ToolbarProps} from "@sui/deps-material";
import * as React from "react";

export function ToolbarBase<T extends ToolbarProps>(children: React.ReactNode): (props: T) => React.JSX.Element {
  return (...props): React.JSX.Element => (
    <Toolbar {...props}>
      {[children, props[0].children]}
    </Toolbar>
  );
}
