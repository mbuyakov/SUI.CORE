import * as React from 'react';

import {ISerializable, SerializableDnDChild} from "../Draggable/Serializable";
import { Rendered } from '../other';

export type DEFAULT_ROOT_TYPES = 'root' | 'row' | string;

export interface IMetaCardRenderParams<TProps, TItem = any> {
  item: TItem;
  props: TProps;
}

export abstract class MetaCardPlugin<T extends ISerializable> {
  public abstract addText: string;
  public abstract availableRootTypes: DEFAULT_ROOT_TYPES[];
  public abstract id: string;
  public abstract type: DEFAULT_ROOT_TYPES;

  public abstract getNewSettingsInstance(fromPlain: boolean): Rendered<SerializableDnDChild<T>>;
  public abstract render(params: IMetaCardRenderParams<T>): JSX.Element;
}
