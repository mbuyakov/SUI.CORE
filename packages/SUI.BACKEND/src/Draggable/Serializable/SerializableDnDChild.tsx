import { defaultIfNotNumber } from '@smsoft/sui-core';

import {DnDChild, IBaseDnDChildProps} from "../DnDChild";

import {ISerializable, ISerializableComponent} from "./ISerializable";
import autobind from 'autobind-decorator';

export type SerializableDnDChildProps<T> = IBaseDnDChildProps & {
  __type?: string
  plain?: T
}

export abstract class SerializableDnDChild<S extends ISerializable, P extends SerializableDnDChildProps<S> = SerializableDnDChildProps<S>> extends DnDChild<P, S> implements ISerializableComponent<S> {

  public isFromPlain: boolean = false;
  public isNew: boolean = false;

  protected constructor(props: P) {
    super(props);
    if (!this.state) {
      let version: number;
      if(props.plain) {
        this.isFromPlain = true;
        version = defaultIfNotNumber(props.plain && props.plain.version, 0);
      } else {
        this.isNew = true;
        version = this.getCurrentVersion();
      }
      this.state = {
        __type: props.__type,
        ...props.plain,
        id: props.id,
        version
      };
    }
  }

  public abstract getCurrentVersion(): number;

  @autobind
  // Get saved and latest version
  public isVersionNotLast(): false | [number, number] {
    const current = this.state.version;
    const latest = this.getCurrentVersion();

    return current === latest ? false : [current, latest];
  }

  public abstract toPlainObject(): S;

}
