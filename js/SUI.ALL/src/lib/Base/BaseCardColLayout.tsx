import { OneOrArrayWithNulls } from '../typeWrappers';

import { IBaseCardItemLayout } from './BaseCardItemLayout';
import { IBaseFormItemLayout } from './BaseFormItemLayout';

export interface IBaseCardColLayout<T> {
  items: OneOrArrayWithNulls<IBaseCardItemLayout<T>>;
}

export type IBaseFormColLayout<FIELDS extends string> = Omit<IBaseCardColLayout<never>, 'items'> & {
  items: OneOrArrayWithNulls<IBaseFormItemLayout<FIELDS>>
}
