import React from "react";
import {IRawRoute} from "@sui/core";


export const BasicLayoutContext: React.Context<{
  drawerOpen: boolean;
  setDrawerState(open: boolean): void;
  openDrawerWidth: number;
  drawerWidth: number;
  routes: IRawRoute[];
}> = React.createContext(null);
