import * as React from 'react';

import { IObjectWithIndex } from '../other';

import { BaseForm } from './BaseForm';

export interface IBaseFormContext {
  baseForm: BaseForm
  customInputNodesProps?: IObjectWithIndex
  verticalLabel: boolean
}

// tslint:disable-next-line:no-any variable-name
export const BaseFormContext = React.createContext<IBaseFormContext>(null as any);
