import { Rendered } from '@smsoft/sui-core';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as React from 'react';

import {ISerializable} from "../Draggable/Serializable/ISerializable";
import {SerializableDnDChild} from "../Draggable/Serializable/SerializableDnDChild";

export type DEFAULT_ROOT_TYPES = 'root' | 'row' | string;

// tslint:disable-next-line:no-any
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
