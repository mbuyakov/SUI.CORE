import React from "react";
import {ISuiThemeContext} from "./types";

export const KludgeForStorybook = React.createContext(undefined);
export const SuiThemeContext = React.createContext<ISuiThemeContext>(undefined as never);
