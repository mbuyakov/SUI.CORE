import * as React from 'react';

import { IObjectWithIndex } from '../other';

import { BaseForm } from './BaseForm';

export interface IBaseFormContext {
  baseForm: BaseForm
  customFinalInputNodesProps?: IObjectWithIndex
  customInputNodesProps?: IObjectWithIndex
  verticalLabel: boolean
}

export const BaseFormContext = React.createContext<IBaseFormContext>(null as any);
