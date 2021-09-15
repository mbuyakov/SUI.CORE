import {List} from "@material-ui/core";
import React from "react";

export const ColumnChooserContainer: React.FC<{ children: JSX.Element[] }> = ({children, ...restProps}) => (
  <List
    dense={true}
    {...restProps}
  >
    {children.filter(it => it.key[0] != "_")}
  </List>
)

