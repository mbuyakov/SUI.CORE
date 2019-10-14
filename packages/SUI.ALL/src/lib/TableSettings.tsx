/* tslint:disable:jsx-no-lambda no-magic-numbers no-any object-literal-sort-keys no-floating-promises promise-function-async */
import { Cached } from '@material-ui/icons';
import { Table } from 'antd';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Popover from 'antd/lib/popover';
import Select from 'antd/lib/select';
import Column from 'antd/lib/table/Column';
import autobind from 'autobind-decorator';
import * as React from 'react';
import { Link } from 'react-router-dom';

import {AdditionalTab} from './additionalTabs';
import { BaseCard } from './Base';
import { SortingDirection } from './BaseTable';
import {ColumnInfo, TableInfo, TableInfoManager} from './cache';
import { getDataByKey } from './dataKey';
import { DescriptionItem } from './DescriptionItem';
import { DraggableRowTable } from './DraggableRowTable';
import { FullScreenModal } from './FullScreenModal';
import { generateUpdate, generateUpdateFn, mutate, query } from './gql';
import { PromisedInput, PromisedMaterialIconButton, PromisedSelect, PromisedSwitch } from './Inputs';
import { MainSettings } from './MetaCardSettings';
import { IObjectWithIndex, sleep } from './other';
import { NamePopover, TagsPopover, VisibleByRolesPopover } from './Popover';
import { SUI_ROW, SUI_ROW_GROW_LEFT } from './styles';
import { TableRenderSettingsPopover } from './TableRenderSettings';
import { TooltipIcon } from './TooltipIcon';
import { IColumnInfo, IColumnInfoTag, IFilterType, IGraphQLConnection, IName, IRole, ISubtotalType, ITableInfo } from './types';
import { draw, fullReloadTableInfo, getLinkForTable, getMetaInitProps } from './utils';
import { WaitData } from './WaitData';


const SPIN_DELAY = 500;
const SAVE_SLEEP_DELAY = 1000;

export function FullScreenTableSettings(props: {
  defaultOpen?: boolean
  dialogRef?: React.RefObject<FullScreenModal>,
  id: string,
}): JSX.Element {
  const { id, dialogRef, defaultOpen } = props;

  return (
    <FullScreenModal
      ref={dialogRef}
      title={<div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content auto', alignItems: 'center'}}>
        <span>Настройки таблицы&nbsp;</span>
        <WaitData<string>
          promise={TableInfoManager.getById(id).then(table => table.getNameOrTableName())}
        >
          {name => (<span>{name}</span>)}
        </WaitData>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PromisedMaterialIconButton
            promise={getMetaInitProps().metaschemaRefreshPromise}
            tooltipText="Обновить метасхему"
            progressColor="secondary"
          >
            <Cached style={{color: 'white'}}/>
          </PromisedMaterialIconButton>
        </div>
      </div>}
      defaultOpen={defaultOpen || false}
    >
      {getPopupContainer => (
        <TableSettings
          // tslint:disable-next-line:no-magic-numbers
          startTimeout={200}
          popupMode={true}
          getPopupContainer={getPopupContainer}
          id={id}
        />
      )}
    </FullScreenModal>
  );
}

interface ITableSettingsProps {
  id: string;
  popupMode?: boolean;
  startTimeout?: number;

  getPopupContainer(): HTMLElement;
}

interface ITableSettingsState {
  allFilterTypes?: IGraphQLConnection<IFilterType>;
  allRoles?: IGraphQLConnection<IRole>,
  allSubtotalTypes?: IGraphQLConnection<ISubtotalType>;
  tableInfoById?: ITableInfo;
}

export class TableSettings extends React.Component<ITableSettingsProps, ITableSettingsState> {

  private static getElementBySortType<T>(sorting: SortingDirection, ascElement: T, descElement: T, emptyElement: T): T {
    return (sorting === 'asc')
      ? ascElement
      : (sorting === 'desc')
        ? descElement
        : emptyElement;
  }

  private readonly waitDataRef: React.RefObject<WaitData> = React.createRef<WaitData>();

  public constructor(props: any) {
    super(props);
    this.state = {};
  }

  @autobind
  public componentDidMount(): void {
    sleep(this.props.startTimeout || 0).then(_ =>
      query(`{
        allRoles {
          nodes {
            id
            name
          }
        }
        allSubtotalTypes {
          nodes {
            id
            name
          }
        }
        allFilterTypes {
          nodes {
            id
            name
          }
        }
        tableInfoById(id: "${this.props.id}") {
          id
          engineByEngineId {
            id
            name
          }
          schemaName
          tableName
          isCatalog
          isAudited
          linkColumnInfoId
          foreignLinkColumnInfoId
          colorSettings
          nameByNameId {
            id
            name
            description
          }
          type
          cardRenderParams
          columnInfosByTableInfoId {
            nodes {
              id
              columnName
              columnType
              visible
              width
              order
              defaultVisible
              defaultValue
              defaultSorting
              defaultGrouping
              tableRenderParams
              filterTypeId
              subtotalTypeId
              columnInfoReferencesByColumnInfoId {
                nodes {
                  columnInfoByForeignColumnInfoId {
                    tableInfoId
                    columnName
                    nameByNameId {
                      name
                    }
                    tableInfoByTableInfoId {
                      tableName
                      nameByNameId {
                        name
                      }
                    } 
                  }
                }
              }
              columnInfoTagsByColumnInfoId {
                nodes {
                  id
                  tagByTagId {
                    id
                    code
                    name
                  }
                }
              }
              columnInfoRolesByColumnInfoId {
                nodes {
                  id
                  roleId
                }
              }
              nameByNameId {
                id
                name
                description
              }
            }
          }
        }
      }`).then(res => this.setState(res)),
    );
  }


  public componentDidUpdate(prevProps: ITableSettingsProps): void {
    if (this.props.id !== prevProps.id) {
      this.setState({ tableInfoById: null }, this.componentDidMount);
    }
  }

  public async componentWillUnmount(): Promise<void> {
    await this.updateData();
  }

  public render(): JSX.Element {
    return (
      <WaitData<ITableSettingsState>
        data={this.state.tableInfoById && this.state.allRoles && this.state.allSubtotalTypes && this.state}
        alwaysUpdate={true}
        ref={this.waitDataRef}
        delay={this.props.startTimeout ? 0 : SPIN_DELAY}
        hideChildren={false}
      >
        {(data): JSX.Element => {
          if (!data) {
            return <div style={{ height: 300 }}/>;
          }

          return (
            <BaseCard<ITableInfo>
              item={data.tableInfoById}
              rows={[
                {
                  cols: {
                    items: [
                      {
                        render: (): JSX.Element =>
                          (
                            this.props.popupMode
                              ? <></>
                              : <>
                                <div>
                                  <Link to={getLinkForTable(data.tableInfoById.tableName, 'table')}>
                                    <Button
                                      href={null}
                                      icon="profile"
                                      type="primary"
                                      style={{ marginBottom: 8 }}
                                    >
                                      Показать таблицу
                                    </Button>
                                  </Link>
                                  <Popover
                                    trigger="click"
                                    title="Введите ID"
                                    overlayStyle={{ width: 200 }}
                                    content={
                                      <PromisedInput
                                        rowStyle={{ width: 200 - 32 }}
                                        icon="right"
                                        type="number"
                                        promise={(value: any): any => {
                                          getMetaInitProps().routerPushFn(getLinkForTable(data.tableInfoById.tableName, 'card', value));

                                          // Stub
                                          return new Promise((resolve): void => resolve());
                                        }}
                                      />
                                    }
                                  >
                                    <Button
                                      href={null}
                                      icon="idcard"
                                      type="primary"
                                      style={{ marginBottom: 8, marginLeft: 8 }}
                                    >
                                      Показать карточку
                                    </Button>
                                  </Popover>
                                  {/*<Button*/}
                                  {/*  href={null}*/}
                                  {/*  icon="sync"*/}
                                  {/*  type="primary"*/}
                                  {/*  style={{ marginBottom: 8, marginLeft: 8 }}*/}
                                  {/*  onClick={() => fullReloadTableInfo(this.props.id)}*/}
                                  {/*>*/}
                                  {/*  Синхронизировать вкладки*/}
                                  {/*</Button>*/}
                                </div>
                                {/*<WaitData
                                  promise={TableInfoManager.getById(`${item.tableName}_ui`)}
                                  alwaysUpdate={true}
                                  hideChildren={false}
                                >
                                  {probableUi => (
                                    probableUi && <Alert
                                      message="Внимание"
                                      description={
                                        <>
                                          Вы находитесь на странице объекта {item.nameByNameId && item.nameByNameId.name ? `${item.nameByNameId.name} (${item.schemaName}.${item.tableName})` : `${item.schemaName}.${item.tableName}`},
                                          однако есть объект <RouterLink type="button" text={probableUi.nameId ? `${probableUi.getNameOrTableName()} (${probableUi.schemaName}.${probableUi.tableName})` : `${probableUi.schemaName}.${probableUi.tableName}`} to={LinkTo.OMNI_TABLE_SETTINGS(probableUi.id)}/>,
                                          который скорее всего должен отображаться в интерфейсе.
                                        </>
                                      }
                                      type="info"
                                      showIcon={true}
                                      style={{ marginBottom: 8 }}
                                    />
                                  )}
                                </WaitData>*/}
                              </>
                          ),
                      },
                    ],
                  },
                },
                {
                  cols: [
                    {
                      items: [
                        {
                          title: 'ID',
                          dataKey: 'id',
                        },
                        {
                          title: 'Хранилище',
                          dataKey: ['engineByEngineId', 'name'],
                        },
                        {
                          title: 'Имя схемы в БД',
                          dataKey: 'schemaName',
                        },
                        {
                          title: 'Имя таблицы в БД',
                          dataKey: 'tableName',
                        },
                        {
                          dataKey: ['nameByNameId'],
                          render: (value: any): JSX.Element => (
                            <Card
                              size="small"
                              type="inner"
                              title="Имя таблицы в интерфейсе"
                              extra={
                                <NamePopover
                                  id={value && value.id}
                                  onChanged={this.onNameChanged}
                                  getPopupContainer={this.props.getPopupContainer}
                                />
                              }
                              style={{ maxWidth: 500, marginBottom: 8 }}
                            >
                              {value
                              && <>
                                <DescriptionItem title="Имя">
                                  {value.name}
                                </DescriptionItem>
                                <DescriptionItem title="Описание">
                                  {value.description}
                                </DescriptionItem>
                              </>
                              || <Empty/>}
                            </Card>
                          ),
                        },
                      ],
                    },
                    {
                      items: [
                        {
                          title: 'Поле ссылки на форме списка',
                          dataKey: 'linkColumnInfoId',
                          render: (value: string): JSX.Element => (
                            <div style={{ width: 500 }}>
                              <PromisedSelect
                                defaultValue={value}
                                promise={generateUpdateFn('tableInfo', this.props.id, 'linkColumnInfoId')}
                              >
                                <Select.Option value={null}>
                                  --Не задано--
                                </Select.Option>
                                {data.tableInfoById.columnInfosByTableInfoId.nodes.map(col => (
                                  <Select.Option value={col.id}>
                                    {(col.nameByNameId && col.nameByNameId.name) || col.columnName}
                                  </Select.Option>
                                ))}
                              </PromisedSelect>
                            </div>
                          ),
                        },
                        {
                          title: 'Поле ссылки из другого объекта',
                          dataKey: 'foreignLinkColumnInfoId',
                          render: (value: string): JSX.Element => (
                            <div style={{ width: 500 }}>
                              <PromisedSelect
                                defaultValue={value}
                                promise={generateUpdateFn('tableInfo', this.props.id, 'foreignLinkColumnInfoId')}
                              >
                                <Select.Option value={null}>
                                  --Не задано--
                                </Select.Option>
                                {data.tableInfoById.columnInfosByTableInfoId.nodes.map(col => (
                                  <Select.Option value={col.id}>
                                    {(col.nameByNameId && col.nameByNameId.name) || col.columnName}
                                  </Select.Option>
                                ))}
                              </PromisedSelect>
                            </div>
                          ),
                        },
                        {
                          title: 'Справочник',
                          dataKey: 'isCatalog',
                          render: (value: boolean): JSX.Element => (
                            <PromisedSwitch
                              defaultChecked={value}
                              promise={generateUpdateFn('tableInfo', this.props.id, 'isCatalog')}
                            />
                          ),
                        },
                      ].concat((getDataByKey(data, 'tableInfoById', 'type') !== 'BASE TABLE' || ['audit', 'meta'].includes(getDataByKey(data, 'tableInfoById', 'schemaName')))
                        ? []
                        : [{
                          title: 'Вести аудит',
                          dataKey: 'isAudited',
                          render: (value: boolean): JSX.Element => (
                            <PromisedSwitch
                              defaultChecked={value}
                              promise={this.onIsAuditedChangeFn}
                            />
                          ),
                        }],
                      ),
                    },
                  ],
                },
                {
                  tabs: [
                    {
                      title: 'Общее',
                      icon: 'global',
                      rows: [
                        {
                          cols: [
                            {
                              items: [
                                {
                                  containerStyle: { marginTop: 8, marginBottom: 0 },
                                  title: 'Доступность для всех колонок',
                                  dataKey: ['columnInfosByTableInfoId', 'nodes'],
                                  render: (value: IColumnInfo[]): JSX.Element => (
                                    <PromisedSwitch
                                      defaultChecked={value.every(col => col.visible)}
                                      popconfirmSettings={true}
                                      promise={(newValue: boolean): Promise<any> => {
                                        let promise = new Promise<any>((resolve): void => resolve());
                                        value.map(col => {
                                          promise = promise.then(_ => this.updateColField(col.id, 'visible', newValue, false));
                                        });

                                        return promise;
                                      }}
                                    />
                                  ),
                                },
                              ],
                            },
                          ],
                        },
                        {
                          isDivider: true,
                        },
                        {
                          cols: [
                            {
                              items: [
                                {
                                  dataKey: ['columnInfosByTableInfoId', 'nodes'],
                                  render: (value: IColumnInfo[]): JSX.Element => (
                                    <>
                                      <DraggableRowTable<IColumnInfo>
                                        scroll={{ x: true }}
                                        pagination={false}
                                        dataSource={value.sort((a, b): number => a.order - b.order)}
                                        bordered={true}
                                        onOrderChanged={(sortedDataSource: any): Promise<any> => Promise.all(sortedDataSource.map((line: any, index: any): Promise<any> => this.updateColField(line.id, 'order', index, false, false, (sortedDataSource.length - 1) === index)))}
                                      >
                                        <Column<IColumnInfo>
                                          title="Имя в БД"
                                          render={(_, record): string => record.columnName}
                                        />
                                        <Column<IColumnInfo>
                                          title="Ссылается на поле"
                                          render={(_, record): React.ReactNode => {
                                            const refColInfo = getDataByKey<IColumnInfo>(record, 'columnInfoReferencesByColumnInfoId', 'nodes', 0, 'columnInfoByForeignColumnInfoId');
                                            const refTableInfo = refColInfo && refColInfo.tableInfoByTableInfoId;

                                            return refColInfo
                                              ? (<Button
                                                size="small"
                                                type="ghost"
                                                onClick={() => draw(<FullScreenTableSettings id={refColInfo.tableInfoId} defaultOpen={true}/>)}
                                              >
                                                {`${refTableInfo.nameByNameId ? refTableInfo.nameByNameId.name : refTableInfo.tableName}.${refColInfo.nameByNameId ? refColInfo.nameByNameId.name : refColInfo.columnName}`}
                                              </Button>)
                                              : null;
                                          }}
                                        />
                                        <Column<IColumnInfo>
                                          title="Тип"
                                          render={(_, record): string => record.columnType}
                                        />
                                        <Column<IColumnInfo>
                                          title="Обязательность"
                                          render={(_, record): JSX.Element => (
                                            <Icon style={{ fontSize: 18 }} type={record.isNullable ? 'close' : 'check'}/>
                                          )}
                                        />
                                        <Column<IColumnInfo>
                                          title="Значение по умолчанию"
                                          render={(_, record): string => record.defaultValue}
                                        />
                                        <Column<IColumnInfo>
                                          title="Имя"
                                          render={(_, record): JSX.Element => (
                                            <div className={SUI_ROW_GROW_LEFT}>
                                              {record.nameByNameId
                                                ? <span>
                                              {record.nameByNameId.name}
                                                  {record.nameByNameId.description && <TooltipIcon>
                                                    {record.nameByNameId.description}
                                                  </TooltipIcon>}
                                            </span>
                                                : <span>Не выбрано</span>
                                              }
                                              <NamePopover
                                                getPopupContainer={this.props.getPopupContainer}
                                                id={record.nameByNameId && record.nameByNameId.id}
                                                onChanged={(newId): Promise<any> =>
                                                  generateUpdate('columnInfo', record.id, 'nameId', newId)
                                                    .then<IName>(__ => {
                                                      if (newId === null) {
                                                        // tslint:disable-next-line:no-object-literal-type-assertion
                                                        return {} as IName;
                                                      }

                                                      return query(`{
                                                        nameById(id: "${newId}") {
                                                          name
                                                          description
                                                        }
                                                      }`, true);
                                                    })
                                                    .then(newName => {
                                                      // tslint:disable-next-line:no-object-literal-type-assertion
                                                      const name = {
                                                        id: newId,
                                                        name: newName.name,
                                                        description: newName.description,
                                                      } as IName;

                                                      return this.updateColField(record.id, 'nameByNameId', name, false, true);
                                                    })}
                                              />
                                            </div>
                                          )}
                                        />
                                        <Column<IColumnInfo>
                                          title="Теги"
                                          render={(_, record): JSX.Element => (
                                            <div className={SUI_ROW_GROW_LEFT}>
                                              {record.columnInfoTagsByColumnInfoId.nodes.length > 0
                                                ? <ul style={{ paddingLeft: 16, marginBottom: 0 }}>
                                                  {record.columnInfoTagsByColumnInfoId.nodes.map(con => (
                                                    <li>
                                                      {con.tagByTagId.code} {con.tagByTagId.name && `(${con.tagByTagId.name})`}
                                                    </li>
                                                  ))}
                                                </ul>
                                                : <span>Не выбрано</span>
                                              }
                                              <TagsPopover
                                                getPopupContainer={this.props.getPopupContainer}
                                                colTagsConnection={record.columnInfoTagsByColumnInfoId}
                                                onChanged={(newIds): Promise<any> =>
                                                  Promise.all(record.columnInfoTagsByColumnInfoId.nodes.map((columnInfoTag: IColumnInfoTag) => mutate(`mutation {
                                                    deleteColumnInfoTagById(input: {id: "${columnInfoTag.id}"}) {
                                                      clientMutationId
                                                    }
                                                  }`)))
                                                    .then(__ => Promise.all(newIds.map(tagId => mutate<{ columnInfoTag: IColumnInfoTag }>(`mutation {
                                                      createColumnInfoTag(input: {columnInfoTag: {columnInfoId: "${record.id}", tagId: "${tagId}"}}) {
                                                        columnInfoTag {
                                                          id
                                                          tagByTagId {
                                                            id
                                                            code
                                                            name
                                                          }
                                                        }
                                                      }
                                                    }`, true))))
                                                    // tslint:disable-next-line:no-shadowed-variable
                                                    .then(columnInfoTags => this.updateColField(record.id, 'columnInfoTagsByColumnInfoId', { nodes: columnInfoTags.map(value => value.columnInfoTag) }, false, true))
                                                }
                                              />
                                            </div>
                                          )}
                                        />
                                        <Column<IColumnInfo>
                                          title="Доступна"
                                          dataIndex="id"
                                          width={120}
                                          filterMultiple={true}
                                          filters={
                                            data.allRoles.nodes.map(role => ({
                                              text: role.name,
                                              value: role.id.toString(),
                                            }))
                                          }
                                          onFilter={(f, record): boolean => record.columnInfoRolesByColumnInfoId.nodes.some(node => f.includes(node.roleId))}
                                          render={(_, record): JSX.Element => (
                                            <VisibleByRolesPopover
                                              getPopupContainer={this.props.getPopupContainer}
                                              roles={data.allRoles.nodes}
                                              visiblePromise={this.updateColFieldFn(record.id, 'visible')}
                                              afterRolesPromise={(roles): Promise<any> => this.updateColField(record.id, 'columnInfoRolesByColumnInfoId', { nodes: roles || [] }, false, true)}
                                              columnInfo={record}
                                            />
                                          )}
                                        />
                                      </DraggableRowTable>
                                    </>
                                  ),
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      title: 'Табличное представление',
                      icon: 'profile',
                      rows: [
                        {
                          cols: [
                            {
                              items: [
                                {
                                  containerStyle: { marginTop: 8, marginBottom: 0 },
                                  title: 'Отображение по умолчанию для всех колонок',
                                  dataKey: ['columnInfosByTableInfoId', 'nodes'],
                                  render: (value: IColumnInfo[]): JSX.Element => (
                                    <PromisedSwitch
                                      defaultChecked={value.every(col => col.defaultVisible)}
                                      popconfirmSettings={true}
                                      promise={(newValue: boolean): Promise<any> => {
                                        let promise = new Promise<any>((resolve): void => resolve());
                                        value.map(col => {
                                          promise = promise.then(_ => this.updateColField(col.id, 'defaultVisible', newValue, false));
                                        });

                                        return promise;
                                      }}
                                    />
                                  ),
                                },
                              ],
                            },
                          ],
                        },
                        {
                          isDivider: true,
                        },
                        {
                          cols: [
                            {
                              items: [
                                {
                                  dataKey: ['columnInfosByTableInfoId', 'nodes'],
                                  render: (value: IColumnInfo[], item: any): JSX.Element => (
                                    <Table
                                      components={{
                                        body: {
                                          row: (props): JSX.Element => {
                                            const visible = props.children[0].props.record.visible;

                                            return (
                                              <tr
                                                {...props}
                                                style={{
                                                  ...props.style,
                                                  backgroundColor: !visible ? '#dadada' : (props.style && props.style.backgroundColor),
                                                }}
                                              />
                                            );
                                          },
                                        },
                                      }}
                                      scroll={{ x: true }}
                                      pagination={false}
                                      dataSource={value.sort((a, b): number => a.order - b.order)}
                                      bordered={true}
                                    >
                                      <Column<IColumnInfo>
                                        title="Имя"
                                        render={(_, record): string => (record.nameByNameId && record.nameByNameId.name) || record.columnName}
                                      />
                                      <Column<IColumnInfo>
                                        title="Настройки рендера"
                                        render={(_, record): JSX.Element => (
                                          <div className={SUI_ROW}>
                                            <TableRenderSettingsPopover
                                              getPopupContainer={this.props.getPopupContainer}
                                              tableInfo={item}
                                              tableRenderParams={record.tableRenderParams}
                                              promise={this.updateColFieldFn(record.id, 'tableRenderParams')}
                                            />
                                          </div>
                                        )}
                                      />
                                      <Column<IColumnInfo>
                                        title="Отображается по умолчанию"
                                        width={130}
                                        render={(_, record): JSX.Element => (
                                          <div className={SUI_ROW}>
                                            <PromisedSwitch
                                              defaultChecked={record.defaultVisible}
                                              promise={this.updateColFieldFn(record.id, 'defaultVisible')}
                                            />
                                          </div>
                                        )}
                                      />
                                      <Column<IColumnInfo>
                                        title="Группировка по умолчанию"
                                        width={120}
                                        render={(_, record): JSX.Element => (
                                          <div className={SUI_ROW}>
                                            <PromisedSwitch
                                              defaultChecked={record.defaultGrouping}
                                              promise={this.updateColFieldFn(record.id, 'defaultGrouping')}
                                            />
                                          </div>
                                        )}
                                      />
                                      <Column<IColumnInfo>
                                        title="Сортировка по умолчанию"
                                        width={120}
                                        render={(_, record): JSX.Element => (
                                          <div className={SUI_ROW}>
                                            <Button
                                              href={null}
                                              htmlType="button"
                                              type={TableSettings.getElementBySortType(
                                                record.defaultSorting as SortingDirection,
                                                'primary',
                                                'primary',
                                                undefined,
                                              )}
                                              icon={TableSettings.getElementBySortType<string>(
                                                record.defaultSorting as SortingDirection,
                                                'sort-ascending',
                                                'sort-descending',
                                                'question',
                                              )}
                                              onClick={() => {
                                                const sequence = [null, 'asc', 'desc'];
                                                this.updateColFieldFn(record.id, 'defaultSorting')(
                                                  sequence[(sequence.indexOf(record.defaultSorting || null) + 1) % sequence.length],
                                                );
                                              }}
                                            />
                                          </div>
                                        )}
                                      />
                                      <Column<IColumnInfo>
                                        title="Ширина"
                                        width={150}
                                        render={(_, record): JSX.Element => (
                                          <PromisedInput
                                            type="number"
                                            defaultValue={record.width as any}
                                            promise={this.updateColFieldFn(record.id, 'width')}
                                          />
                                        )}
                                      />
                                      <Column<IColumnInfo>
                                        width={150}
                                        title="Фильтр"
                                        render={(_, record): JSX.Element => (
                                          <PromisedSelect
                                            defaultValue={record.filterTypeId}
                                            promise={this.updateColFieldFn(record.id, 'filterTypeId')}
                                          >
                                            <Select.Option value={null}>
                                              --Не задано--
                                            </Select.Option>
                                            {data.allFilterTypes.nodes.map(type => (
                                              <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
                                            ))}
                                          </PromisedSelect>
                                        )}
                                      />
                                      <Column<IColumnInfo>
                                        width={150}
                                        title="Подытог"
                                        render={(_, record): JSX.Element => (
                                          <PromisedSelect
                                            defaultValue={record.subtotalTypeId}
                                            promise={this.updateColFieldFn(record.id, 'subtotalTypeId')}
                                          >
                                            <Select.Option value={null}>
                                              --Не задано--
                                            </Select.Option>
                                            {data.allSubtotalTypes.nodes.map(type => (
                                              <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
                                            ))}
                                          </PromisedSelect>
                                        )}
                                      />
                                    </Table>
                                  ),
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      icon: 'card',
                      rows: {
                        cols: {
                          items: {
                            render: (_: any, item: any): JSX.Element => {
                              let plain;
                              try {
                                plain = JSON.parse(item.cardRenderParams);
                              } catch (e) {
                                // Ignore
                                // console.log(e);
                              }

                              // console.log(plain);
                              return (
                                <MainSettings
                                  getPopupContainer={this.props.getPopupContainer}
                                  tableId={item.id}
                                  // tslint:disable-next-line:jsx-no-lambda
                                  onSave={settings => Promise.all([
                                    generateUpdate('tableInfo', item.id, 'cardRenderParams', JSON.stringify(JSON.stringify(settings)).slice(1, -1)),
                                    sleep(SAVE_SLEEP_DELAY),
                                  ])}
                                  plain={plain}
                                  fields={item.columnInfosByTableInfoId.nodes.map((node: IColumnInfo) => node.id)}
                                />
                              );
                            },
                          },
                        },
                      },
                      title: 'Карточка объекта',
                    },
                    {
                      icon: 'build',
                      rows: {
                        cols: {
                          items: {
                            render: (_: any, item: ITableInfo): JSX.Element =>
                              (
                                <AdditionalTab
                                  columnInfos={item.columnInfosByTableInfoId.nodes.map(iColumnInfo => new ColumnInfo(iColumnInfo))}
                                  tableInfo={new TableInfo(item)}
                                />
                              ),
                          },
                        },
                      },
                      title: 'Дополнительно',
                    },
                  ],
                },
              ]}
            />
          );
        }}
      </WaitData>
    );
  }

  @autobind
  private onIsAuditedChangeFn(value: boolean): Promise<any> {
    const mutationName = value ? 'startAuditTable' : 'stopAuditTable';

    return new Promise((resolve, reject): void => {
      mutate(`mutation {
        ${mutationName}(input: {tableInfoId: "${this.state.tableInfoById.id}"}) {
          clientMutationId
        }
      }`)
        .then(_ => {
          const tableInfoById = this.state.tableInfoById;
          tableInfoById.isAudited = value;
          // tslint:disable-next-line:no-unnecessary-callback-wrapper
          this.setState({ tableInfoById }, () => resolve());
        })
        .catch(_ => reject(`Ошибка при ${value ? 'включении' : 'выключении'} аудита`));
    });
  }

  @autobind
  private onNameChanged(newId: string): Promise<any> {
    return new Promise((resolve, reject): void => {
      mutate(`mutation {
        updateTableInfoById(input: {id: "${this.props.id}", tableInfoPatch: {nameId: "${newId}"}}) {
          clientMutationId
        }
      }`)
        .then(_ => {
          resolve();
          this.waitDataRef.current.updateData();
        })
        .catch(_ => reject('Ошибка при сохранении связи сущностей'));
    });
  }

  @autobind
  private updateColField(id: string, field: keyof IColumnInfo, value: any, sleepAtEnd: boolean = true, onlyState: boolean = false, needUpdateState: boolean = true): Promise<any> {
    const updateState = new Promise((resolve): void => {
      const tableInfoById = this.state.tableInfoById;
      const colIndex = tableInfoById.columnInfosByTableInfoId.nodes.findIndex(col => col.id === id);
      (tableInfoById.columnInfosByTableInfoId.nodes[colIndex] as IObjectWithIndex)[field] = value;
      if (needUpdateState) {
        this.setState({ tableInfoById });
      }
      if (sleepAtEnd) {
        return resolve(sleep(Number.MAX_VALUE));
      }

      return resolve();
    });

    if (onlyState) {
      return updateState;
    }

    return generateUpdate('columnInfo', id, field, value).then(_ => updateState);
  }

  @autobind
  private updateColFieldFn(id: string, field: keyof IColumnInfo, sleepAtEnd?: boolean, onlyState?: boolean): (value: any) => Promise<any> {
    return (value: any): Promise<any> => this.updateColField(id, field, value, sleepAtEnd, onlyState);
  }

  @autobind
  private async updateData(): Promise<any> {
    await fullReloadTableInfo(this.props.id);
  }
}
