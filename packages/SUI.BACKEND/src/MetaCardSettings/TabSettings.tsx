import {IBaseCardTabLayout} from "@smsoft/sui-base-components";
import { Input } from 'antd';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {DeletableSmallCard} from "../DeletableSmallCard";
import {IBaseDnDChildProps} from "../Draggable/DnDChild";
import {DnDList} from "../Draggable/DnDList";
import {ISerializable} from "../Draggable/Serializable/ISerializable";
import {SerializableDnDChild} from "../Draggable/Serializable/SerializableDnDChild";
import {COMMON__GRID, TAB_SETTINGS__UNACTIVE_BUTTON} from "../styles";

import {RowSettings, SerializedRowSettings} from "./RowSettings";
import {RowsList} from "./RowsList";

// tslint:disable-next-line:no-any
type TabSettingsState = Omit<IBaseCardTabLayout<any>, 'rows'> & {
  rows: SerializedRowSettings[];
};

export type SerializedTabSettings = ISerializable<TabSettingsState>;


interface ITabSettingsProps extends IBaseDnDChildProps {
  plain?: SerializedTabSettings
}

export class TabSettings extends SerializableDnDChild<SerializedTabSettings> {

  private readonly rowsRef: React.RefObject<DnDList<RowSettings>> = React.createRef();
  private readonly TAB_LAST_VERSION: number = 1;

  public constructor(props: ITabSettingsProps) {
    super(props);

    if (this.isNew) {
      this.state = {
        ...this.state,
        rows: [],
      };
    }
  }

  public getCurrentVersion(): number {
    return this.TAB_LAST_VERSION;
  }

  public render(): JSX.Element {
    const isVersionNotLast = this.isVersionNotLast();

    return (
      <DeletableSmallCard
        title="Вкладка"
        onDelete={this.props.onDelete}
        draggable={this.props.draggable}
        style={{ minWidth: 600 }}
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        isVersionNotLast={isVersionNotLast}
        settingsPopover={
          <div className={COMMON__GRID}>
            <span>Заголовок</span>
            <Input value={this.state.title} onChange={this.onTitleChanged}/>
            <span>Иконка</span>
            <span>
              <Input value={this.state.icon} onChange={this.onIconChanged}/>
              {this.state.icon && <Tooltip
                title="Предпросмотр иконки"
              >
                <Button
                  icon={this.state.icon}
                  type={'dashed'}
                  disabled={true}
                  className={TAB_SETTINGS__UNACTIVE_BUTTON}
                  style={{
                    marginLeft: 8,
                    minWidth: 32
                  }}
                />
              </Tooltip>}
            </span>
          </div>}
      >
        <RowsList
          titleEnabled={false}
          style={{ border: 0 }}
          listRef={this.rowsRef}
          id={`${this.state.id}-rows`}
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

  @autobind
  public saveState(): void {
    super.saveState();
    this.rowsRef.current.saveState();
  }

  @autobind
  public toPlainObject(): SerializedTabSettings {
    return {
      ...this.state,
      rows: this.rowsRef.current.getChildRefs().map(ref => ref.toPlainObject()),
    };
  }

  @autobind
  private onIconChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ icon: e.target.value });
  }

  @autobind
  private onTitleChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ title: e.target.value });
  }
}
