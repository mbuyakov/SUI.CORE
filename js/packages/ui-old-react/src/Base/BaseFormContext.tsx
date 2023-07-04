import * as React from "react";

import {BaseForm} from "./BaseForm";
import {IObjectWithIndex} from "@sui/util-types";

export interface IBaseFormContext {
  baseForm: BaseForm;
  customFinalInputNodesProps?: IObjectWithIndex;
  customInputNodesProps?: IObjectWithIndex;
  initialValues?: IObjectWithIndex;
  verticalLabel: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BaseFormContext = React.createContext<IBaseFormContext>(null as any);
