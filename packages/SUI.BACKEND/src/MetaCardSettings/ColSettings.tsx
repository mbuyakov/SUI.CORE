import {IBaseCardColLayout} from "@smsoft/sui-base-components";
import { getDataByKey } from '@smsoft/sui-core';
import autobind from 'autobind-decorator';
import * as React from 'react';
import { ContainerOptions } from 'react-smooth-dnd';

import {DnDList} from "../Draggable/DnDList";
import {ISerializable} from "../Draggable/Serializable/ISerializable";
import {SerializableDnDChild, SerializableDnDChildProps} from "../Draggable/Serializable/SerializableDnDChild";

import {ItemSettings, SerializedItemSettings} from "./ItemSettings";

// tslint:disable-next-line:no-any
type ColSettingsState = IBaseCardColLayout<any> & {
  items: SerializedItemSettings[];
};

export type SerializedColSettings = ISerializable<ColSettingsState>;

export class ColSettings extends SerializableDnDChild<SerializedColSettings> {

  private readonly itemsRef: React.RefObject<DnDList<ItemSettings>> = React.createRef();
  private LAST_COL_VERSION: number = 1;

  public constructor(props: SerializableDnDChildProps<SerializedColSettings>) {
    super(props);
    if (this.isNew) {
      this.state = {
        ...this.state,
        items: [],
      };
    }
  }

  public getCurrentVersion(): number {
    return this.LAST_COL_VERSION;
  }

  public render(): JSX.Element {
    return (
      <DnDList<ItemSettings>
        ref={this.itemsRef}
        draggable={this.props.draggable}
        id={`${this.state.id}-items`}
        type="ItemSettings"
        title="Колонка"
        onDelete={this.props.onDelete}
        deletableChildren={true}
        shouldAcceptDrop={this.shouldAcceptDrop}
        initialItems={this.state.items.map(item => (
          <ItemSettings
            plain={item}
            id={item.id}
          />
        ))}
      />
    );
  }

  @autobind
  public saveState(): void {
    super.saveState();
    this.itemsRef.current.saveState();
  }

  @autobind
  public toPlainObject(): SerializedColSettings {
    return {
      ...this.state,
      items: this.itemsRef.current.getChildRefs().map(ref => ref.toPlainObject()),
    };
  }

  @autobind
  // tslint:disable-next-line:no-any
  private shouldAcceptDrop(sourceContainerOptions: ContainerOptions, payload: any): boolean {
    const payloadId = getDataByKey(payload, 'props', 'id');
    // console.log(this.itemsRef.current.getChildRefs());

    return sourceContainerOptions.groupName === 'ItemSettings' && (sourceContainerOptions.behaviour === 'copy' ? !this.itemsRef.current.getChildRefs().map(ref => ref.props.id).includes(payloadId) : true);
  }
}
