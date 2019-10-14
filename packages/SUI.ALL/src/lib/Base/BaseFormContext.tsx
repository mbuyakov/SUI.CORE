import {WrappedFormUtils} from 'antd/lib/form/Form';
import * as React from 'react';

import { IObjectWithIndex } from '../other';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
// tslint:disable-next-line:no-any use-default-type-parameter

export interface IBaseFormContext {
  form: WrappedFormUtils
  formValues: IObjectWithIndex
  verticalLabel: boolean
}

// tslint:disable-next-line:no-any variable-name
export const BaseFormContext = React.createContext<IBaseFormContext>(null as any);
