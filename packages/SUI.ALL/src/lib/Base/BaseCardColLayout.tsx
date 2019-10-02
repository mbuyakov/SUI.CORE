import { OneOrArrayWithNulls } from '../typeWrappers';

import { IBaseCardItemLayout } from './BaseCardItemLayout';
import { IBaseFormItemLayout } from './BaseFormItemLayout';

export interface IBaseCardColLayout<T> {
  items: OneOrArrayWithNulls<IBaseCardItemLayout<T>>;
}

export type IBaseFormColLayout<T> = Omit<IBaseCardColLayout<T>, 'items'> & {
  items: OneOrArrayWithNulls<IBaseFormItemLayout<T>>
}
