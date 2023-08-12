import {Merge} from "@sui/ui-old-core";
import {Checkbox, Input, CheckboxChangeEvent} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import * as React from "react";

// noinspection ES6PreferShortImport
import {IBaseCardCollapseLayout, IBaseCardItemLayout} from "../Base";
// noinspection ES6PreferShortImport
import {DeletableSmallCard} from "../DeletableSmallCard";
// noinspection ES6PreferShortImport
import {DnDList} from "../Draggable";
// noinspection ES6PreferShortImport
import {ISerializable, SerializableDnDChild, SerializableDnDChildProps} from "../Draggable/Serializable";
// noinspection ES6PreferShortImport
import {COMMON__GRID} from "../styles";

import {RowSettings, SerializedRowSettings} from "./RowSettings";
import {RowsList} from "./RowsList";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      };
    }
  }

  public getCurrentVersion(): number {
    return LAST_COLLAPSE_VERSION;
  }

  public render(): React.JSX.Element {
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
