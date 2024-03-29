import {Input} from "antd";
import Checkbox, {CheckboxChangeEvent} from "antd/lib/checkbox";
import autobind from "autobind-decorator";
import * as React from "react";

import { IBaseCardCollapseLayout, IBaseCardItemLayout } from '../Base';
import {DeletableSmallCard} from "../DeletableSmallCard";
import {DnDList} from "../Draggable";
import {ISerializable, SerializableDnDChild, SerializableDnDChildProps} from "../Draggable/Serializable";
import { Merge } from '../other';
import {COMMON__GRID} from "../styles";

import {RowSettings, SerializedRowSettings} from "./RowSettings";
import {RowsList} from "./RowsList";

type CollapseSettingsState = Merge<IBaseCardCollapseLayout<any, IBaseCardItemLayout<any>>, {
  rows: SerializedRowSettings[];
}>;

export type SerializedCollapseSettings = ISerializable<CollapseSettingsState>;

const LAST_COLLAPSE_VERSION: number = 1;

export class CollapseSettings extends SerializableDnDChild<SerializedCollapseSettings> {

  private readonly rowsRef: React.RefObject<DnDList<RowSettings>> = React.createRef();

  public constructor(props: SerializableDnDChildProps<SerializedCollapseSettings>) {
    super(props);
    if (this.isNew) {
      this.state = {
        ...this.state,
        rows: []
      }
    }
  }

  public getCurrentVersion(): number {
    return LAST_COLLAPSE_VERSION;
  }

  public render(): JSX.Element {
    const isVersionNotLast = this.isVersionNotLast();

    return (
      <DeletableSmallCard
        title="Панель"
        onDelete={this.props.onDelete}
        draggable={this.props.draggable}
        style={{minWidth: 600}}
        bodyStyle={{padding: 0, paddingTop: 1}}
        isVersionNotLast={isVersionNotLast}
        settingsPopover={
          <div className={COMMON__GRID}>
            <span>Заголовок</span>
            <Input value={this.state.title} onChange={this.onTitleChanged}/>
            <span>Открыта по умолчанию</span>
            <Checkbox checked={this.state.defaultOpened} onChange={this.onDefaultOpenedChanged}/>
          </div>}
      >
        <RowsList
          titleEnabled={false}
          listRef={this.rowsRef}
          id={`${this.state.id}-rows`}
          style={{border: 0}}
          initialItems={this.state.rows.map(row => (
            <RowSettings
              plain={row}
              id={row.id}
            />
          ))}
        />
      </DeletableSmallCard>
    );
  }

  // DON'T BIND WITH DECORATOR OR IN CONSTRUCTOR
  public saveState(): void {
    super.saveState();
    this.rowsRef.current.saveState();
  }

  @autobind
  public toPlainObject(): SerializedCollapseSettings {
    return {
      ...this.state,
      rows: this.rowsRef.current.getChildRefs().map(ref => ref.toPlainObject())
    };
  }

  @autobind
  private onDefaultOpenedChanged(e: CheckboxChangeEvent): void {
    this.setState({defaultOpened: e.target.checked});
  }

  @autobind
  private onTitleChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({title: e.target.value});
  }
}
