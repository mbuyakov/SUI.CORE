/* tslint:disable:no-floating-promises */
import { Chip } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import SettingsIcon from '@material-ui/icons/Settings';
import {IBaseCardItemLayout} from "@smsoft/sui-base-components";
import { capitalize, Merge } from '@smsoft/sui-core';
import { ColumnInfo, ColumnInfoManager, IName, NameManager, NamePopover, TableInfoManager } from '@smsoft/sui-meta';
import { WaitData } from '@smsoft/sui-promised';
import { Spin, Tooltip } from 'antd';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Popover from 'antd/lib/popover';
import Select from 'antd/lib/select';
import Switch from 'antd/lib/switch';
import autobind from 'autobind-decorator';
import camelCase from 'lodash/camelCase';
import * as React from 'react';

import {DnDDragHandler} from "../Draggable";
import {ISerializable, SerializableDnDChild, SerializableDnDChildProps} from "../Draggable/Serializable";
import {COMMON__GRID, ITEM_SETTINGS__DELETE_ICON, ITEM_SETTINGS__SETTINGS_ICON} from "../styles";

import {DebugModeContext} from "./DebugModeContext";
import {GetPopupContainerContext} from "./GetPopupContainerContext";
import {OldVersionWarning} from "./OldVersionWarning";

export type ItemSettingsFormatType = null | 'ts' | 'date' | 'time';

// tslint:disable-next-line:no-any
type ItemSettingsState = Merge<IBaseCardItemLayout<any>, {
  colId?: string
  formatType: ItemSettingsFormatType
  freeTitleEnabled?: boolean
  linkEnabled?: boolean
  nameFromColId?: string
  nameFromNameId?: string
  nameId?: string
  originalTitle?: string
  version?: number
}>;

export type SerializedItemSettings = ISerializable<ItemSettingsState>;

export class ItemSettings extends SerializableDnDChild<SerializedItemSettings> {

  private readonly LAST_ITEM_VERSION: number = 1;

  public constructor(props: SerializableDnDChildProps<SerializedItemSettings>) {
    super(props);
    if (this.isNew) {
      this.onCreate();
    }
  }

  public getCurrentVersion(): number {
    return this.LAST_ITEM_VERSION;
  }

  public render(): JSX.Element {
    const isVersionNotLast = this.isVersionNotLast();

    return (
      <GetPopupContainerContext.Consumer>
        {getPopupContainer => (
          <DebugModeContext.Consumer>
            {debugMode => (
              <Chip
                label={
                  <>
                    <DnDDragHandler/>
                    {(debugMode ? this.state.originalTitle : (this.state.title || (this.state.nameId ? this.state.nameFromNameId : this.state.nameFromColId) || this.state.originalTitle)) || (<Spin style={{ marginTop: 6 }}/>)}
                    {isVersionNotLast && <OldVersionWarning ids={isVersionNotLast} style={{ marginLeft: 8, marginRight: 0 }}/>}
                    {this.props.onDelete && <>
                      <Popover
                        getPopupContainer={getPopupContainer}
                        trigger="click"
                        content={
                          <div className={COMMON__GRID}>
                            <span>Заголовок</span>
                            <span>
                            <Tooltip
                              title={
                                <>
                                  <span>Выбор из справочника имён</span>
                                  <br/>
                                  <span> или произвольный ввод</span>
                                </>}
                            >
                              <Switch
                                unCheckedChildren={<Icon type="ordered-list"/>}
                                checkedChildren={<Icon type="edit"/>}
                                checked={this.state.freeTitleEnabled}
                                style={{ marginRight: 8 }}
                                onChange={this.onFreeTitleEnabledChanged}
                              />
                            </Tooltip>
                              {this.state.freeTitleEnabled
                                ? <Input
                                  value={this.state.title as string}
                                  placeholder={this.state.nameFromColId || this.state.originalTitle}
                                  onChange={this.onTitleChanged}
                                />
                                : <>
                                <span
                                  style={{
                                    marginRight: 8,
                                    width: '100%',
                                  }}
                                >
                                  {this.state.nameId
                                    ? <WaitData<IName>
                                      query={`{
                                      nameById(id: "${this.state.nameId}") {
                                        name
                                      }
                                    }`}
                                      extractFirstKey={true}
                                      alwaysUpdate={true}
                                    >
                                      {name => name.name}
                                    </WaitData>
                                    : 'Не выбранно'
                                  }
                                </span>
                                  <NamePopover
                                    getPopupContainer={getPopupContainer}
                                    onChanged={this.onNameIdChanged}
                                    id={this.state.nameId}
                                  />
                                </>
                              }
                          </span>
                            <span>Форматирование</span>
                            <Select<ItemSettingsFormatType>
                              value={this.state.formatType}
                              onChange={this.onFormatTimeChanged}
                            >
                              <Select.Option value={null}>Как есть</Select.Option>
                              <Select.Option value="ts">Дата + время</Select.Option>
                              <Select.Option value="date">Дата</Select.Option>
                              <Select.Option value="time">Время</Select.Option>
                            </Select>
                            {this.state.version >= 1 && (<>
                              <span>Ссылка?</span>
                              <span>
                              <Switch
                                checked={this.state.linkEnabled}
                                style={{ marginRight: 8 }}
                                onChange={this.onLinkEnabledChanged}
                              />
                            </span>
                            </>)}
                          </div>}
                      >
                        <SettingsIcon
                          className={ITEM_SETTINGS__SETTINGS_ICON}
                        />
                      </Popover>
                      <CancelIcon
                        className={ITEM_SETTINGS__DELETE_ICON}
                        onClick={this.props.onDelete}
                      />
                    </>}
                  </>
                }
              />
            )}
          </DebugModeContext.Consumer>
        )}
      </GetPopupContainerContext.Consumer>
    );
  }

  @autobind
  public toPlainObject(): SerializedItemSettings {
    return {
      ...this.state,
      nameId: this.state.freeTitleEnabled ? null : this.state.nameId,
      title: this.state.freeTitleEnabled ? this.state.title : null,
    };
  }

  @autobind
  private async onCreate(): Promise<void> {
    const colsInfo = await Promise.all<ColumnInfo>(this.state.id.split('|').map(col => ColumnInfoManager.getById(col)));
    const lastCol = colsInfo[colsInfo.length - 1];
    const colId = lastCol.id;
    const originalTitle = lastCol.columnName;
    let nameFromColId = null;
    let nameFromNameId = null;
    if (lastCol.nameId) {
      nameFromColId = (await NameManager.getById(lastCol.nameId)).name;
    }
    if (this.state.nameId) {
      const name = await NameManager.getById(this.state.nameId);
      nameFromNameId = name.name;
    }
    const dataKey = await Promise.all(colsInfo.map(async (col, i) => {
      if (((colsInfo.length - 1) !== i) && (colsInfo.length !== 1)) {
        if (col.foreignColumnInfo[0]) {
          const foreignColInfo = await ColumnInfoManager.getById(col.foreignColumnInfo[0]);
          const foreignTableInfo = await TableInfoManager.getById(foreignColInfo.tableInfoId);

          return `${camelCase(foreignTableInfo.tableName)}By${capitalize(camelCase(col.columnName))}`;
        }
      }

      return camelCase(col.columnName);
    }));
    this.setState({ dataKey, colId, nameFromColId, nameFromNameId, originalTitle });
  }

  @autobind
  private onFormatTimeChanged(formatType: ItemSettingsFormatType): void {
    this.setState({ formatType });
  }

  @autobind
  private onFreeTitleEnabledChanged(freeTitleEnabled: boolean): void {
    this.setState({ freeTitleEnabled });
  }

  @autobind
  private onLinkEnabledChanged(linkEnabled: boolean): void {
    this.setState({ linkEnabled });
  }

  @autobind
  private async onNameIdChanged(nameId: string): Promise<void> {
    let nameFromNameId = null;
    if (nameId) {
      const name = await NameManager.getById(nameId);
      nameFromNameId = name.name;
    }
    this.setState({ nameId, nameFromNameId });
  }

  @autobind
  private onTitleChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ title: e.target.value });
  }

}
