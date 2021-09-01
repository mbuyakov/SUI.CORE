/* eslint-disable @typescript-eslint/no-explicit-any */
import {camelCase, Merge} from '@sui/core';
import {Button, Checkbox, Input, Mentions, Menu} from 'antd';
import autobind from 'autobind-decorator';
import * as React from 'react';
import {CheckboxChangeEvent} from '@/antdMissedExport';

// noinspection ES6PreferShortImport
import {IBaseCardItemLayout, IBaseCardRowLayout, IBaseCardRowWithCollapseLayout, IBaseCardRowWithColsLayout, IBaseCardRowWithDividerLayout, IBaseCardRowWithMetaTableLayout, IBaseCardRowWithTabsLayout, IMetaTableProps, isRowWithCollapse, isRowWithCols, isRowWithDivider, isRowWithMetaTable, isRowWithTabs} from '../Base';
// noinspection ES6PreferShortImport
import {DeletableSmallCard} from '../DeletableSmallCard';
// noinspection ES6PreferShortImport
import {DnDList, IBaseDnDChildProps} from '../Draggable';
// noinspection ES6PreferShortImport
import {ISerializable, SerializableDnDChild} from '../Draggable/Serializable';
// noinspection ES6PreferShortImport
import {COMMON__GRID} from '../styles';

import {CollapseSettings, SerializedCollapseSettings} from './CollapseSettings';
import {ColSettings, SerializedColSettings} from './ColSettings';
import {FieldsContext} from './FieldsContext';
import {OldVersionWarning} from './OldVersionWarning';
import {SerializedTabSettings, TabSettings} from './TabSettings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RowWithColsSettings = Merge<IBaseCardRowWithColsLayout<any, IBaseCardItemLayout<any>>, {
  cols: SerializedColSettings[]
}>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RowWithCollapseSettings = Merge<IBaseCardRowWithCollapseLayout<any, IBaseCardItemLayout<any>>, {
  collapsePanels: SerializedCollapseSettings[]
}>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RowWithTabsSettings = Merge<IBaseCardRowWithTabsLayout<any, IBaseCardItemLayout<any>>, {
  tabs: SerializedTabSettings[]
}>

type RowSettingsState = Partial<RowWithColsSettings &
  RowWithCollapseSettings &
  IBaseCardRowWithDividerLayout &
  IBaseCardRowWithMetaTableLayout &
  RowWithTabsSettings>;

export type SerializedRowSettings = ISerializable<RowSettingsState>;
export type RowType = 'row' | 'tabs' | 'divider' | 'metatable' | 'collapse' | 'UNKNOWN';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBaseCardRow = IBaseCardRowLayout<any, any>;

interface IRowSettingsProps extends IBaseDnDChildProps {
  plain?: SerializedRowSettings
  startType?: RowType
}

const LAST_ROW_VERSION: number = 1;

export class RowSettings extends SerializableDnDChild<SerializedRowSettings, IRowSettingsProps> {
  private readonly collapseSettingsRef: React.RefObject<DnDList<CollapseSettings>> = React.createRef();
  private readonly colSettingsRef: React.RefObject<DnDList<ColSettings>> = React.createRef();
  private readonly tabSettingsRef: React.RefObject<DnDList<TabSettings>> = React.createRef();

  public constructor(props: IRowSettingsProps) {
    super(props);
    console.log(props);
    if (this.isNew) {
      const preState: RowSettingsState = {};
      if (props.startType) {
        switch (props.startType) {
          case 'divider':
            preState.isDivider = true;
            break;
          case 'row':
            preState.cols = [];
            break;
          case 'tabs':
            preState.tabs = [];
            break;
          case 'metatable':
            preState.metaTableProps = {} as IMetaTableProps;
            break;
          case 'collapse':
            preState.collapsePanels = [];
            break;
          default:
            throw new Error('No startType impl');
        }
      }

      this.state = {
        ...this.state,
        ...preState,
      };
    }
  }

  public getCurrentVersion(): number {
    return LAST_ROW_VERSION;
  }

  public render(): JSX.Element {
    const isVersionNotLast = this.isVersionNotLast();
    const type = this.props.startType || this.detectType();
    switch (type) {
      case 'row':
        return (
          <DnDList<ColSettings>
            ref={this.colSettingsRef}
            id={`${this.props.id}-cols`}
            type="ColSettings"
            title="Строка"
            direction="horizontal"
            deletableChildren={true}
            draggable={this.props.draggable}
            onDelete={this.props.onDelete}
            extra={isVersionNotLast && <OldVersionWarning ids={isVersionNotLast}/>}
            initialItems={this.state.cols.map(col => (
              <ColSettings
                plain={col}
                id={col.id}
              />
            ))}
            addButtons={[
              (<Menu.Item
                onClick={this.onColAddClicked}
              >
                Колонку
              </Menu.Item>),
            ]}
          />
        );
      case 'divider':
        return (
          <DeletableSmallCard
            title="Разделитель"
            draggable={this.props.draggable}
            onDelete={this.props.onDelete}
            isVersionNotLast={isVersionNotLast}
          >
            <div className={COMMON__GRID}>
              <span>Заголовок</span>
              <Input value={this.state.dividerText} onChange={this.onDividerTextChanged}/>
              <span>Пунктирная линия</span>
              <Checkbox checked={this.state.dividerDashed} onChange={this.onDividerDashedChanged}/>
            </div>
          </DeletableSmallCard>
        );
      case 'metatable':
        return (
          <DeletableSmallCard
            title="Таблица"
            draggable={this.props.draggable}
            onDelete={this.props.onDelete}
            isVersionNotLast={isVersionNotLast}
          >
            <div className={COMMON__GRID}>
              <span>Таблица</span>
              <Input value={this.state.metaTableProps.table} onChange={this.onTableChanged}/>
              {[
                {
                  field: 'globalFilter',
                  title: 'Глобальный фильтр',
                },
                {
                  field: 'filter',
                  title: 'Фильтр по умолчанию',
                },
              ].map(setting => [
                (<span>{setting.title}</span>),
                (<FieldsContext.Consumer>
                  {(fields): JSX.Element => (
                    <Mentions
                      defaultValue={this.state.metaTableProps[setting.field]}
                      onChange={this.onFilterChanged(setting.field)}
                    >
                      {(fields || []).map(camelCase).map(field => (
                        <Mentions.Option value={field as string}>{field}</Mentions.Option>))}
                    </Mentions>
                  )}
                </FieldsContext.Consumer>),
              ])}
              <span>Показывать заголовок</span>
              <Checkbox checked={this.state.metaTableProps.titleEnabled} onChange={this.onTitleEnabledChanged}/>
            </div>
          </DeletableSmallCard>
        );
      case 'tabs':
        return (
          <DeletableSmallCard
            title="Вкладки"
            draggable={this.props.draggable}
            onDelete={this.props.onDelete}
            settingsPopover={
              <div className={COMMON__GRID}>
                <span>Во вложенной карточке</span>
                <Checkbox checked={this.state.tabsInCard} onChange={this.onTabsInCardChanged}/>
              </div>}
            bodyStyle={{padding: 0, paddingTop: 1}}
            isVersionNotLast={isVersionNotLast}
          >
            <DnDList<TabSettings>
              ref={this.tabSettingsRef}
              id={`${this.props.id}-tabs`}
              type="TabSettings"
              direction="horizontal"
              deletableChildren={true}
              initialItems={this.state.tabs.map((tab: SerializedTabSettings) => (
                <TabSettings
                  plain={tab}
                  id={tab.id}
                />
              ))}
              style={{border: 0}}
              addButtons={[
                (<Menu.Item
                  onClick={this.onTabAddClicked}
                >
                  Вкладку
                </Menu.Item>),
              ]}
            />
          </DeletableSmallCard>
        );
      case 'collapse':
        return (
          <DeletableSmallCard
            title="Коллапс панели"
            draggable={this.props.draggable}
            onDelete={this.props.onDelete}
            bodyStyle={{padding: 0, paddingTop: 1}}
            isVersionNotLast={isVersionNotLast}
            settingsPopover={
              <div className={COMMON__GRID}>
                <span>Убрать отступы</span>
                <Checkbox checked={this.state.fitCollapsePanel} onChange={this.onFitCollapsePanelChanged}/>
              </div>}
          >
            <DnDList<CollapseSettings>
              ref={this.collapseSettingsRef}
              id={`${this.props.id}-collapses`}
              type="CollapseSettings"
              deletableChildren={true}
              style={{border: 0}}
              initialItems={this.state.collapsePanels.map((collapse: SerializedCollapseSettings) => (
                <CollapseSettings
                  plain={collapse}
                  id={collapse.id}
                />
              ))}
              addButtons={[
                (<Menu.Item
                  onClick={this.onCollapseAddClicked}
                >
                  Панель
                </Menu.Item>),
              ]}
            />
          </DeletableSmallCard>
        );
      default:
        return (
          <Button
            href={null}
            danger={true}
            onClick={this.props.onDelete}
          >
            Удалить "{type}"
          </Button>
        );
    }
  }

  // DON'T BIND WITH DECORATOR OR IN CONSTRUCTOR
  public saveState(): void {
    super.saveState();
    if (this.colSettingsRef.current) {
      this.colSettingsRef.current.saveState();
    }
  }

  @autobind
  public toPlainObject(): SerializedRowSettings {
    const type = this.detectType();

    return {
      ...this.state,
      collapsePanels: type === 'collapse' ? this.collapseSettingsRef.current.getChildRefs().map(collapse => collapse.toPlainObject()) : undefined,
      cols: type === 'row' ? this.colSettingsRef.current.getChildRefs().map(col => col.toPlainObject()) : undefined,
      tabs: type === 'tabs' ? this.tabSettingsRef.current.getChildRefs().map(tab => tab.toPlainObject()) : undefined,
    };
  }

  @autobind
  private detectType(): RowType {
    if (isRowWithCols(this.state as AnyBaseCardRow)) {
      return 'row';
    }
    if (isRowWithTabs(this.state as AnyBaseCardRow)) {
      return 'tabs';
    }
    if (isRowWithDivider(this.state as AnyBaseCardRow)) {
      return 'divider';
    }
    if (isRowWithMetaTable(this.state as AnyBaseCardRow)) {
      return 'metatable';
    }
    if (isRowWithCollapse(this.state as AnyBaseCardRow)) {
      return 'collapse';
    }

    return 'UNKNOWN';
  }

  @autobind
  private onColAddClicked(): void {
    this.colSettingsRef.current.addItem(<ColSettings/>);
  }

  @autobind
  private onCollapseAddClicked(): void {
    this.collapseSettingsRef.current.addItem(<CollapseSettings/>);
  }

  @autobind
  private onDividerDashedChanged(e: CheckboxChangeEvent): void {
    this.setState({dividerDashed: e.target.checked});
  }

  @autobind
  private onDividerTextChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({dividerText: e.target.value});
  }

  @autobind
  private onFilterChanged(fieldName: string): (contentState: any) => void {
    return (contentState: any): void =>
      this.setState({metaTableProps: {...this.state.metaTableProps, [fieldName]: contentState}});
  }

  @autobind
  private onFitCollapsePanelChanged(e: CheckboxChangeEvent): void {
    this.setState({fitCollapsePanel: e.target.checked});
  }

  @autobind
  private onTabAddClicked(): void {
    this.tabSettingsRef.current.addItem(<TabSettings/>);
  }

  @autobind
  private onTableChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({metaTableProps: {...this.state.metaTableProps, table: e.target.value}});
  }

  @autobind
  private onTabsInCardChanged(e: CheckboxChangeEvent): void {
    this.setState({tabsInCard: e.target.checked});
  }

  @autobind
  private onTitleEnabledChanged(e: CheckboxChangeEvent): void {
    this.setState({metaTableProps: {...this.state.metaTableProps, titleEnabled: e.target.checked}});
  }
}
