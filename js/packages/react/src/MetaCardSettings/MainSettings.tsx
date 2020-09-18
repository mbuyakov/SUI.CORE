import {SaveOutlined} from "@ant-design/icons/lib";
import { Switch } from 'antd';
import Tooltip from 'antd/lib/tooltip';
import Tree from 'antd/lib/tree';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { ColumnInfoManager, TableInfoManager } from '@sui/core';
import { DeletableSmallCard } from '../DeletableSmallCard';
import { DnDList } from '../Draggable';
import { ISerializableComponent } from '../Draggable/Serializable';
import { PromisedButton } from '../Inputs';
import { MAIN_SETTINGS__CONTAINER, MAIN_SETTINGS__ITEM_TREE } from '../styles';
import { WaitData } from '../WaitData';

import { CardSettings, SerializedCardSettings } from './CardSettings';
import { DebugModeContext } from './DebugModeContext';
import { FieldsContext } from './FieldsContext';
import { GetPopupContainerContext } from './GetPopupContainerContext';
import { ItemSettings } from './ItemSettings';

async function getFieldsForCol(colId: string, includeChildren: boolean = true): Promise<IFieldNode> {
  const colInfo = await ColumnInfoManager.getById(colId);
  const foreignCol = colInfo.foreignColumnInfo[0] && await ColumnInfoManager.getById(colInfo.foreignColumnInfo[0]);
  const foreignTable = foreignCol && await TableInfoManager.getById(foreignCol.tableInfoId);
  let colsInForeignTable = null;

  if (includeChildren && foreignTable) {
    colsInForeignTable = await Promise.all((await foreignTable.getColumns())
      .map(colInForeignTable => getFieldsForCol(colInForeignTable.id, false)));
  }

  return {
    child: colsInForeignTable,
    colInfoIds: colInfo.id,
    isLeaf: !foreignTable,
    title: colInfo.columnName,
  };
}


interface IMainSettingsProps {
  fields: string[]
  plain?: SerializedCardSettings
  tableId: string

  getPopupContainer(): HTMLElement

  onSave(settings: SerializedCardSettings): Promise<any>
}

interface IFieldNode {
  child?: IFieldNode[];
  colInfoIds: string;
  isLeaf?: boolean;
  title: string;
}

const LAST_MAIN_SETTINGS_VERSION: number = 1;

export class MainSettings extends React.Component<IMainSettingsProps, {
  debugMode?: boolean
  fields?: IFieldNode[]
}> implements ISerializableComponent<SerializedCardSettings> {

  private static mapFields(fields: IFieldNode[], parentKey: string = ''): JSX.Element[] {
    return fields.map(field => {
      const key = `${parentKey}${field.colInfoIds}`;
      let child = null;
      if (field.child) {
        child = MainSettings.mapFields(field.child, `${key}|`);
      }
      // let title: React.ReactNode = field.title;
      const title = (
        <>
          {/*{field.child && title}*/}
          <DnDList<ItemSettings>
            type="ItemSettings"
            behaviour="copy"
            initialItems={[
              (<ItemSettings
                id={key}
              />),
            ]}
            noCard={true}
          />
        </>
      );

      return (
        <Tree.TreeNode
          key={key}
          title={title}
          isLeaf={field.isLeaf}
          data={field as any}
          active={undefined as boolean}
        >
          {child}
        </Tree.TreeNode>
      );
    });
  }

  private readonly cardSettingsRef: React.RefObject<CardSettings> = React.createRef();

  public constructor(props: Readonly<IMainSettingsProps>) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    const fields = await Promise.all(this.props.fields.map(field => getFieldsForCol(field)));
    this.setState({ fields });
  }

  public getCurrentVersion(): number {
    return LAST_MAIN_SETTINGS_VERSION;
  }

  public render(): JSX.Element {
    return (
      <div>
        <GetPopupContainerContext.Provider value={this.props.getPopupContainer}>
          <DebugModeContext.Provider value={this.state.debugMode}>
            <div className={MAIN_SETTINGS__CONTAINER}>
              <DeletableSmallCard
                title="Доступные поля"
                extra={
                  <Tooltip
                    title="Оригинальные имена"
                  >
                    <Switch
                      checked={this.state.debugMode}
                      onChange={this.onDebugModeChange}
                    />
                  </Tooltip>
                }
              >
                <WaitData
                  alwaysUpdate={true}
                  data={this.state.fields}
                >
                  <Tree
                    loadData={this.loadData}
                    className={MAIN_SETTINGS__ITEM_TREE}
                  >
                    {this.state.fields && MainSettings.mapFields(this.state.fields)}
                  </Tree>
                </WaitData>
              </DeletableSmallCard>
              <FieldsContext.Provider value={this.state.fields && this.state.fields.map(field => field.title)}>
                <CardSettings
                  ref={this.cardSettingsRef}
                  id={`${this.props.tableId}-CardSettings`}
                  plain={this.props.plain}
                />
              </FieldsContext.Provider>
            </div>
          </DebugModeContext.Provider>
        </GetPopupContainerContext.Provider>
        <PromisedButton
          block={true}
          promise={this.onSave}
          icon={<SaveOutlined/>}
          type="primary"
        >
          Сохранить
        </PromisedButton>
      </div>
    );
  }

  @autobind
  public toPlainObject(): SerializedCardSettings {
    return this.cardSettingsRef.current.toPlainObject();
  }

  @autobind
  private async loadData(treeNode: any): Promise<void> {
    const field: IFieldNode = treeNode.data;
    field.child = (await getFieldsForCol(field.colInfoIds)).child;
    this.setState({ fields: [...this.state.fields] });
  }

  @autobind
  private onDebugModeChange(debugMode: boolean): void {
    this.setState({ debugMode });
  }

  @autobind
  private async onSave(): Promise<any> {
    return this.props.onSave(this.toPlainObject());
  }

}
