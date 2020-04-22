import autobind from 'autobind-decorator';
import * as React from 'react';
import { ContainerOptions } from 'react-smooth-dnd';

import { IBaseCardColLayout, IBaseCardItemLayout } from '../Base';
import { getDataByKey } from '../dataKey';
import {DnDList} from "../Draggable";
import {ISerializable, SerializableDnDChild, SerializableDnDChildProps} from "../Draggable/Serializable";
import { Merge } from '../other';

import {ItemSettings, SerializedItemSettings} from "./ItemSettings";

type ColSettingsState = Merge<IBaseCardColLayout<any, IBaseCardItemLayout<any>>, {
  items: SerializedItemSettings[];
}>;

export type SerializedColSettings = ISerializable<ColSettingsState>;

const LAST_COL_VERSION: number = 1;

export class ColSettings extends SerializableDnDChild<SerializedColSettings> {

  private readonly itemsRef: React.RefObject<DnDList<ItemSettings>> = React.createRef();

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
    return LAST_COL_VERSION;
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
        // shouldAcceptDrop={this.shouldAcceptDrop}
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
  private shouldAcceptDrop(sourceContainerOptions: ContainerOptions, payload: any): boolean {
    console.log(this, sourceContainerOptions, payload);
    const payloadId = getDataByKey(payload, 'props', 'id');
    // console.log(this.itemsRef.current.getChildRefs());

    console.log(sourceContainerOptions.groupName === 'ItemSettings' && (sourceContainerOptions.behaviour === 'copy' ? !this.itemsRef.current.getChildRefs().map(ref => ref.props.id).includes(payloadId) : true));

    return sourceContainerOptions.groupName === 'ItemSettings' && (sourceContainerOptions.behaviour === 'copy' ? !this.itemsRef.current.getChildRefs().map(ref => ref.props.id).includes(payloadId) : true);
  }
}
