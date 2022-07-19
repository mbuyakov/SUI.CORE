/* eslint-disable @typescript-eslint/no-explicit-any */
import {CheckOutlined, CloseOutlined, IdcardOutlined, ProfileOutlined, QuestionOutlined, SortAscendingOutlined, SortDescendingOutlined} from "@ant-design/icons";
import {ThemeProvider, withTheme} from '@material-ui/core';
import IconButton from "@material-ui/core/IconButton";
import {Cached, Edit} from '@material-ui/icons';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {Button, Popover, Select, Table} from 'antd';
import autobind from 'autobind-decorator';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {generateUpdate, generateUpdateFn, getDataByKey, getSUISettings, IColumnInfo, IColumnInfoTag, IFilterType, IGraphQLConnection, IName, IObjectWithIndex, IRole, ISubtotalType, ITableInfo, mutate, query, sleep, TableInfo, TableInfoManager} from "@sui/core";
import axios from "axios";

import {AdditionalTab} from './additionalTabs';
import {BaseCard} from './Base';
import {SortingDirection} from './BaseTable';
import {DraggableRowTable} from './DraggableRowTable';
import {FullScreenModal, FullScreenModalClass} from './FullScreenModal';
import {PromisedInput, PromisedMaterialIconButton, PromisedSelect, PromisedSwitch} from './Inputs';
import {MainSettings} from './MetaCardSettings';
import {NamePopover, TagsPopover, VisibleByRolesPopover} from './Popover';
import {SUI_ROW, SUI_ROW_GROW_LEFT} from './styles';
import {TableRenderSettingsPopover} from './TableRenderSettings';
import {TooltipIcon} from './TooltipIcon';
import {draw, fullReloadTableInfo, getLinkForTable, getUser} from './utils';
import {WaitData} from './WaitData';


const PAGE_SIZE_REGEXP = /^\d+(,\d+)*$/;
const SPIN_DELAY = 500;
const SAVE_SLEEP_DELAY = 1000;

export function FullScreenTableSettings(props: {
  defaultOpen?: boolean
  dialogRef?: React.RefObject<FullScreenModalClass>,
  id: string,
}): JSX.Element {
  const {id, dialogRef, defaultOpen} = props;

  return (
    <FullScreenModal
      innerRef={dialogRef}
      title={<div style={{display: 'grid', gridTemplateColumns: 'max-content max-content auto', alignItems: 'center'}}>
        <span>Настройки таблицы&nbsp;</span>
        <WaitData<string>
          promise={TableInfoManager.getById(id).then(table => table.getNameOrTableName())}
        >
          {(name): JSX.Element => (<span>{name}</span>)}
        </WaitData>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <PromisedMaterialIconButton
            promise={() => axios.get(
              getSUISettings().metaschemaRefreshUrl,
              {headers: {"Authorization": `Bearer ${getUser().accessToken}`}}
            )}
            tooltipText="Обновить метасхему"
            progressColor="secondary"
          >
            <Cached style={{color: 'white'}}/>
          </PromisedMaterialIconButton>
        </div>
      </div>}
      defaultOpen={defaultOpen || false}
    >
      {(getPopupContainer): JSX.Element => (
        <TableSettings
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
  theme?: any;

  getPopupContainer(): HTMLElement;
}

interface ITableSettingsState {
  allFilterTypes?: IGraphQLConnection<IFilterType>;
  allRoles?: IGraphQLConnection<IRole>,
  allSubtotalTypes?: IGraphQLConnection<ISubtotalType>;
  tableInfoById?: ITableInfo;
}

class _TableSettings extends React.Component<ITableSettingsProps, ITableSettingsState> {

  private static getElementBySortType<T>(sorting: SortingDirection, ascElement: T, descElement: T, emptyElement: T): T {
    return (sorting === 'asc')
      ? ascElement
      : (sorting === 'desc')
        ? descElement
        : emptyElement;
  }

  private readonly waitDataRef: React.RefObject<WaitData> = React.createRef<WaitData>();

  public constructor(props: ITableSettingsProps) {
    super(props);
    this.state = {};
  }

  @autobind
  public componentDidMount(): void {
    sleep(this.props.startTimeout || 0).then(() =>
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
          followColumnInfoId
          colorSettings
          pageSizes
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
              wordWrapEnabled
              order
              defaultVisible
              defaultValue
              defaultSorting
              defaultGrouping
              tableRenderParams
              filterTypeId
              subtotalTypeId
              isNullable
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
      this.setState({tableInfoById: null}, this.componentDidMount);
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
            return <div style={{height: 300}}/>;
          }

          const auditable = (getDataByKey(data, 'tableInfoById', 'type') === 'BASE TABLE' && !['audit', 'meta'].includes(getDataByKey(data, 'tableInfoById', 'schemaName')));

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
                                      icon={<ProfileOutlined/>}
                                      type="primary"
                                      style={{marginBottom: 8}}
                                    >
                                      Показать таблицу
                                    </Button>
                                  </Link>
                                  <Popover
                                    trigger="click"
                                    title="Введите ID"
                                    overlayStyle={{width: 200}}
                                    content={
                                      <PromisedInput
                                        rowStyle={{width: 200 - 32}}
                                        icon={<ChevronRightIcon/>}
                                        type="number"
                                        promise={(value: any): any => {
                                          getSUISettings().routerPushFn(getLinkForTable(data.tableInfoById.tableName, 'card', value));

                                          // Stub
                                          return new Promise((resolve): void => resolve(undefined));
                                        }}
                                      />
                                    }
                                  >
                                    <Button
                                      href={null}
                                      icon={<IdcardOutlined/>}
                                      type="primary"
                                      style={{marginBottom: 8, marginLeft: 8}}
                                    >
                                      Показать карточку
                                    </Button>
                                  </Popover>
                                  {/*<Button*/}
                                  {/*  href={null}*/}
                                  {/*  icon={<Icon type={"sync"} />}*/}
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
                          title: 'Имя таблицы в интерфейсе',
                          dataKey: ['nameByNameId'],
                          render: (value: IName | undefined): JSX.Element => (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, max-content)",
                                alignItems: "center"
                              }}
                            >
                              {value && value.name || "Отсутствует"}
                              {value && value.description && (<TooltipIcon>{value.description}</TooltipIcon>)}
                              <NamePopover
                                id={value && value.id}
                                onChanged={this.onNameChanged}
                                getPopupContainer={this.props.getPopupContainer}
                                render={(): JSX.Element => (
                                  <IconButton
                                    style={{marginLeft: 6}}
                                    size="small"
                                  >
                                    <Edit/>
                                  </IconButton>
                                )}
                              />
                            </div>
                          )
                        },
                        {
                          title: 'Разбиение на страницы',
                          dataKey: 'pageSizes',
                          render: (value: string): JSX.Element => (
                            <PromisedInput<string>
                              defaultValue={value}
                              validator={(value): string | undefined => PAGE_SIZE_REGEXP.test(value) ? undefined : "Некорректный формат. Пример: 10,25,100"}
                              promise={generateUpdateFn('tableInfo', this.props.id, "pageSizes")}
                            />
                          ),
                        }
                      ],
                    },
                    {
                      items: [
                        ...[
                          {
                            title: "Поле ссылки на форме списка",
                            dataKey: 'linkColumnInfoId',
                          },
                          {
                            title: "Поле ссылки из другого объекта",
                            dataKey: 'foreignLinkColumnInfoId',
                          },
                          {
                            title: "Поле следования",
                            dataKey: 'followColumnInfoId',
                          }
                        ].map(setting => ({
                          ...setting,
                          render: (value: string): JSX.Element => (
                            <div style={{width: 500}}>
                              <PromisedSelect<string>
                                defaultValue={value}
                                promise={generateUpdateFn('tableInfo', this.props.id, setting.dataKey)}
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
                        })),
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
                        auditable && {
                          title: 'Вести аудит',
                          dataKey: 'isAudited',
                          render: (value: boolean): JSX.Element => (
                            <PromisedSwitch
                              defaultChecked={value}
                              promise={this.onIsAuditedChangeFn}
                            />
                          ),
                        },
                        {render: (): string => ""}
                      ]
                    },
                  ],
                },
                {
                  tabs: [
                    {
                      title: 'Общее',
                      rows: [
                        {
                          cols: [
                            {
                              items: [
                                {
                                  title: 'Доступность для всех колонок',
                                  dataKey: ['columnInfosByTableInfoId', 'nodes'],
                                  render: (value: IColumnInfo[]): JSX.Element => (
                                    <PromisedSwitch
                                      defaultChecked={value.every(col => col.visible)}
                                      popconfirmSettings={true}
                                      promise={(newValue: boolean): Promise<any> => {
                                        let promise = new Promise<any>((resolve): void => resolve(undefined));
                                        value.map(col => {
                                          promise = promise.then(() => this.updateColField(col.id, 'visible', newValue, false));
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
                                      <DraggableRowTable
                                        scroll={{x: true}}
                                        pagination={false}
                                        dataSource={value.sort((a, b): number => a.order - b.order)}
                                        bordered={true}
                                        onOrderChanged={(sortedDataSource: any): Promise<any> => Promise.all(sortedDataSource.map((line: any, index: any): Promise<any> => this.updateColField(line.id, 'order', index, false, false, (sortedDataSource.length - 1) === index)))}
                                      >
                                        <Table.Column<IColumnInfo>
                                          title="Имя в БД"
                                          render={(_, record): string => record.columnName}
                                        />
                                        <Table.Column<IColumnInfo>
                                          title="Ссылается на поле"
                                          render={(_, record): React.ReactNode => {
                                            const refColInfo = getDataByKey<IColumnInfo>(record, 'columnInfoReferencesByColumnInfoId', 'nodes', 0, 'columnInfoByForeignColumnInfoId');
                                            const refTableInfo = refColInfo && refColInfo.tableInfoByTableInfoId;

                                            return refColInfo
                                              ? (
                                                <Button
                                                  size="small"
                                                  type="ghost"
                                                  onClick={(): void => draw(<ThemeProvider theme={this.props.theme}><FullScreenTableSettings id={refColInfo.tableInfoId} defaultOpen={true}/></ThemeProvider>)}
                                                >
                                                  {`${refTableInfo.nameByNameId ? refTableInfo.nameByNameId.name : refTableInfo.tableName}.${refColInfo.nameByNameId ? refColInfo.nameByNameId.name : refColInfo.columnName}`}
                                                </Button>
                                              )
                                              : null;
                                          }}
                                        />
                                        <Table.Column<IColumnInfo>
                                          title="Тип"
                                          render={(_, record): string => record.columnType}
                                        />
                                        <Table.Column<IColumnInfo>
                                          title="Обязательность"
                                          render={(_, record): JSX.Element => (
                                            record.isNullable ? <CloseOutlined style={{fontSize: 18}}/> : <CheckOutlined style={{fontSize: 18}}/>
                                          )}
                                        />
                                        <Table.Column<IColumnInfo>
                                          title="Значение по умолчанию"
                                          render={(_, record): string => record.defaultValue}
                                        />
                                        <Table.Column<IColumnInfo>
                                          title="Имя"
                                          render={(_, record): JSX.Element => (
                                            <div className={SUI_ROW_GROW_LEFT}>
                                              {record.nameByNameId
                                                ? (
                                                  <span>
                                                    {record.nameByNameId.name}
                                                    {record.nameByNameId.description && <TooltipIcon>{record.nameByNameId.description}</TooltipIcon>}
                                                  </span>
                                                )
                                                : <span>Не выбрано</span>
                                              }
                                              <NamePopover
                                                getPopupContainer={this.props.getPopupContainer}
                                                id={record.nameByNameId && record.nameByNameId.id}
                                                onChanged={(newId): Promise<any> =>
                                                  generateUpdate('columnInfo', record.id, 'nameId', newId)
                                                    .then<IName>(() => {
                                                      if (newId === null) {
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
                                        <Table.Column<IColumnInfo>
                                          title="Теги"
                                          render={(_, record): JSX.Element => (
                                            <div className={SUI_ROW_GROW_LEFT}>
                                              {record.columnInfoTagsByColumnInfoId.nodes.length > 0
                                                ? <ul style={{paddingLeft: 16, marginBottom: 0}}>
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
                                                    .then(() => Promise.all(newIds.map(tagId => mutate<{ columnInfoTag: IColumnInfoTag }>(`mutation {
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
                                                    .then(columnInfoTags => this.updateColField(record.id, 'columnInfoTagsByColumnInfoId', {nodes: columnInfoTags.map(value => value.columnInfoTag)}, false, true))
                                                }
                                              />
                                            </div>
                                          )}
                                        />
                                        <Table.Column<IColumnInfo>
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
                                          onFilter={(f: any, record): boolean => record.columnInfoRolesByColumnInfoId.nodes.some(node => f.includes(node.roleId))}
                                          render={(_, record): JSX.Element => (
                                            <VisibleByRolesPopover
                                              getPopupContainer={this.props.getPopupContainer}
                                              roles={data.allRoles.nodes}
                                              visiblePromise={this.updateColFieldFn(record.id, 'visible')}
                                              afterRolesPromise={(roles): Promise<any> => this.updateColField(record.id, 'columnInfoRolesByColumnInfoId', {nodes: roles || []}, false, true)}
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
                      rows: [
                        {
                          cols: [
                            {
                              items: [
                                {
                                  title: 'Отображение по умолчанию для всех колонок',
                                  dataKey: ['columnInfosByTableInfoId', 'nodes'],
                                  render: (value: IColumnInfo[]): JSX.Element => (
                                    <PromisedSwitch
                                      defaultChecked={value.every(col => col.defaultVisible)}
                                      popconfirmSettings={true}
                                      promise={(newValue: boolean): Promise<any> => {
                                        let promise = new Promise<any>((resolve): void => resolve(undefined));
                                        value.map(col => {
                                          promise = promise.then(() => this.updateColField(col.id, 'defaultVisible', newValue, false));
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
                                          row: (props: any): JSX.Element => {
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
                                      scroll={{x: true}}
                                      pagination={false}
                                      dataSource={value.sort((a, b): number => a.order - b.order)}
                                      bordered={true}
                                    >
                                      <Table.Column<IColumnInfo>
                                        title="Имя"
                                        render={(_, record): string => (record.nameByNameId && record.nameByNameId.name) || record.columnName}
                                      />
                                      <Table.Column<IColumnInfo>
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
                                      <Table.Column<IColumnInfo>
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
                                      <Table.Column<IColumnInfo>
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
                                      <Table.Column<IColumnInfo>
                                        title="Сортировка по умолчанию"
                                        width={120}
                                        render={(_, record): JSX.Element => (
                                          <div className={SUI_ROW}>
                                            <Button
                                              href={null}
                                              htmlType="button"
                                              type={_TableSettings.getElementBySortType(
                                                record.defaultSorting as SortingDirection,
                                                'primary',
                                                'primary',
                                                undefined,
                                              )}
                                              icon={_TableSettings.getElementBySortType<React.ReactNode>(record.defaultSorting as SortingDirection, (<SortAscendingOutlined/>), (<SortDescendingOutlined/>), (<QuestionOutlined/>))}
                                              onClick={(): void => {
                                                const sequence = [null, 'asc', 'desc'];
                                                this.updateColFieldFn(record.id, 'defaultSorting')(
                                                  sequence[(sequence.indexOf(record.defaultSorting || null) + 1) % sequence.length],
                                                );
                                              }}
                                            />
                                          </div>
                                        )}
                                      />
                                      <Table.Column<IColumnInfo>
                                        title="Ширина"
                                        width={150}
                                        render={(_, record): JSX.Element => (
                                          <PromisedInput
                                            type="number"
                                            defaultValue={record.width}
                                            promise={this.updateColFieldFn(record.id, 'width')}
                                          />
                                        )}
                                      />
                                      <Table.Column<IColumnInfo>
                                        title="Перенос слов"
                                        width={120}
                                        render={(_, record): JSX.Element => (
                                          <PromisedSwitch
                                            defaultChecked={record.wordWrapEnabled}
                                            promise={this.updateColFieldFn(record.id, 'wordWrapEnabled')}
                                          />
                                        )}
                                      />
                                      <Table.Column<IColumnInfo>
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
                                      <Table.Column<IColumnInfo>
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
                                  onSave={(settings): Promise<unknown> => Promise.all([
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
                      rows: {
                        cols: {
                          items: {
                            render: (_: any, item: ITableInfo): JSX.Element => (<AdditionalTab tableInfo={new TableInfo(item)}/>),
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
        .then(() => {
          const tableInfoById = this.state.tableInfoById;
          tableInfoById.isAudited = value;
          this.setState({tableInfoById}, () => resolve(undefined));
        })
        .catch(() => reject(`Ошибка при ${value ? 'включении' : 'выключении'} аудита`));
    });
  }

  @autobind
  private onNameChanged(newId: string): Promise<any> {
    return new Promise((resolve, reject): void => {
      mutate(`mutation {
        updateTableInfoById(input: {id: "${this.props.id}", tableInfoPatch: {nameId: ${newId ? `"${newId}"` : null}}}) {
          clientMutationId
        }
      }`)
        .then(() => {
          resolve(undefined);
          this.waitDataRef.current.updateData();
        })
        .catch(() => reject('Ошибка при сохранении связи сущностей'));
    });
  }

  @autobind
  private updateColField(id: string, field: keyof IColumnInfo, value: any, sleepAtEnd: boolean = true, onlyState: boolean = false, needUpdateState: boolean = true): Promise<any> {
    const updateState = new Promise((resolve): void => {
      const tableInfoById = this.state.tableInfoById;
      const colIndex = tableInfoById.columnInfosByTableInfoId.nodes.findIndex(col => col.id === id);
      (tableInfoById.columnInfosByTableInfoId.nodes[colIndex] as IObjectWithIndex)[field] = value;
      if (needUpdateState) {
        this.setState({tableInfoById});
      }
      if (sleepAtEnd) {
        return resolve(sleep(Number.MAX_VALUE));
      }

      return resolve(undefined);
    });

    if (onlyState) {
      return updateState;
    }

    return generateUpdate('columnInfo', id, field, value).then(() => updateState);
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

export const TableSettings = withTheme(_TableSettings);
