/* eslint-disable @typescript-eslint/no-explicit-any */
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {Cached} from '@mui/icons-material';
import {addPluralEnding, addQuotesIfString, capitalize, ColumnInfoManager, DataKey, dataKeysToDataTree, getDataByKey, isValidUuid, NameManager, NO_DATA_TEXT, normalizeDataKey, query, TableInfoManager, wrapInArray, wrapInArrayWithoutNulls} from "@sui/ui-old-core";
import {Card} from "@sui/deps-antd";
import autobind from 'autobind-decorator';
import camelCase from 'lodash/camelCase';
import * as React from 'react';

// noinspection ES6PreferShortImport
import {BaseCard, DATA_KEY_REGEXP, IBaseCardItemLayout, IBaseCardRowLayout, IBaseCardRowWithColsLayout} from '../Base';
// noinspection ES6PreferShortImport
import {RouterLink} from '../Link';
// noinspection ES6PreferShortImport
import {SerializedCardSettings, SerializedFreeText, SerializedItemSettings, SerializedRowSettings} from "../MetaCardSettings";
// noinspection ES6PreferShortImport
import {TableSettingsDialog} from '../plugins';
// noinspection ES6PreferShortImport
import {getLinkForTable, getReferencedTableInfo, isAdmin} from '../utils';
// noinspection ES6PreferShortImport
import {WaitData} from '../WaitData';

import {MetaCardConfigurator} from './MetaCardConfigurator';

export interface IMetaCardProps {
  itemId: string;
  tableId: string;
}

function getIdDataKey(dataKey: DataKey): DataKey {
  const ndk = normalizeDataKey(dataKey).slice();
  ndk.pop();
  ndk.push('id');

  return ndk;
}

export class MetaCard extends React.Component<IMetaCardProps, {
  error?: string;
  item?: any;
  ready?: boolean;
  schema?: SerializedCardSettings;
  tableInfoId?: string;
}> {

  // private listenedTableInfoId: string;
  // private listenerId: number;

  public constructor(props: IMetaCardProps) {
    super(props);
    this.state = {};
  }

  public componentDidMount(): void {
    // noinspection JSIgnoredPromiseFromCall
    this.updateData();
  }

  public componentDidUpdate(prevProps: Readonly<IMetaCardProps>): void {
    if ((prevProps.tableId !== this.props.tableId) || (prevProps.itemId !== this.props.itemId)) {
      // noinspection JSIgnoredPromiseFromCall
      this.updateData();
    }
  }

  public render(): JSX.Element {
    //console.log(this);

    return (
      <Card
        title={
          this.state.ready &&
          this.state.schema &&
          this.state.schema.title &&
          this.state.schema.title.map(title => {
            // noinspection SuspiciousTypeOfGuard
            if (typeof (title as SerializedFreeText).text === 'string') {
              return (title as SerializedFreeText).text;
            }

            const data = getDataByKey(this.state.item && this.state.item.nodes[0], (title as SerializedItemSettings).dataKey);
            return data == null ? NO_DATA_TEXT : data;
          }).join(' ')
        }
        extra={
          <div
            style={{
              display: 'flex',
            }}
          >
            <Tooltip
              title='Обновить данные'
              placement='bottom'
              enterDelay={300}
            >
              <IconButton
                onClick={this.onUpdateButtonClicked}
                style={{
                  height: 48,
                  // margin: -14,
                  marginBottom: -12,
                  marginTop: -12,
                }}
                size="large">
                <Cached/>
              </IconButton>
            </Tooltip>
            {isAdmin() && this.state.tableInfoId && <TableSettingsDialog
              id={this.state.tableInfoId}
              buttonStyle={{
                height: 48,
                marginBottom: -18,
                marginRight: -14,
                marginTop: -20,
              }}
            />}
          </div>
        }
        bodyStyle={{
          padding: 0,
        }}
      >
        {this.state.ready
          ? (
            <BaseCard
              cardStyle={{margin: -1}}
              item={this.state.item && this.state.item.nodes[0]}
              rows={this.state.schema && this.state.schema.rows as IBaseCardRowLayout<any, any>[]}
            />
          )
          : (
            <WaitData
              data={this.state.ready}
              error={!!this.state.error}
              errorTip={this.state.error}
              alwaysUpdate={true}
            >
              {(): null => null}
            </WaitData>
          )
        }
      </Card>
    );
  }

  @autobind
  public async updateData(clearState: boolean = true): Promise<void> {
    clearState && this.setState({ready: false, item: null, schema: null});
    const object = await TableInfoManager.getById(this.props.tableId);
    this.setState({tableInfoId: object.id});

    const schema: SerializedCardSettings = object.cardRenderParams && JSON.parse(object.cardRenderParams);

    if (schema == null || !((schema.rows && schema.rows.length) || (schema.title && schema.title.length))) {
      this.setState({error: 'Схема не настроена'});

      return;
    }

    // Map items
    const rowParser = async (row: SerializedRowSettings): Promise<void> => {
      if (row.__type) {
        const plugin = MetaCardConfigurator.plugins.get(row.__type);

        if (!plugin) {
          this.setState({error: `Плагин "${row.__type}" не найден`});
        }

        (row as unknown as IBaseCardRowWithColsLayout<any, IBaseCardItemLayout<any>>).cols = {
          items: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dataKey: row.field,
            render: (item: any): JSX.Element => plugin.render({props: row, item}),
          },
        };

        return;
      }

      if (row.cols) {
        await Promise.all(wrapInArray(row.cols).map(async (col) => {
          await Promise.all(wrapInArray(col.items).map(async (item) => {
            const columnInfo = item.colId && (await ColumnInfoManager.getById(item.colId));

            let title = 'UNKNOWN';
            if (item.title) {
              title = item.title as string;
            } else if (item.nameId) {
              title = (await NameManager.getById(item.nameId)).name;
            } else {
              title = columnInfo.getNameOrColumnName();
            }
            item.title = title;

            if (item.linkEnabled) {
              const link = getLinkForTable((await TableInfoManager.getById(columnInfo.tableInfoId)).tableName, 'card', ':id');
              if (link) {
                item.render = (value: any, obj: any): JSX.Element => value && (
                  <RouterLink
                    to={link.replace(
                      ':id',
                      getDataByKey(obj, getIdDataKey(item.dataKey)),
                    )}
                    text={value}
                    type="button"
                    monospace={false}
                  />
                );
              }
            }
          }));
        }));
      }

      if (row.tabs) {
        row.tabs.forEach(tab => {
          wrapInArray(tab.rows).forEach(rowParser);
        });
      }

      if (row.collapsePanels) {
        row.collapsePanels.forEach(collapse => {
          wrapInArray(collapse.rows).forEach(rowParser);
        });
      }
    };

    await Promise.all(schema.rows.map(async (row) => rowParser(row)));

    this.setState({schema});

    try {
      query(await this.generateQuery(this.props.tableId, this.props.itemId, schema), true)
        .then(item => {
          this.setState({item, ready: true});
        });
    } catch (e) {
      this.setState({error: e.stack && e.stack.toString() || e});
    }
  }

  @autobind
  private async generateQuery(table: string, itemId: string | number, schema: SerializedCardSettings): Promise<string> {
    const dataKeys = await this.getAllDataKeys(schema);

    return `{
      all${capitalize(camelCase(addPluralEnding(table)))}(filter: {id: {equalTo: ${addQuotesIfString(itemId)}}}) {
        nodes ${dataKeysToDataTree([...dataKeys, '__typename']).toString()}
      }
    }`;
  }

  @autobind
  private async getAllDataKeys(schema: SerializedCardSettings): Promise<DataKey[]> {
    const ret: DataKey[] = [];

    const rowParser = (row: SerializedRowSettings): DataKey[] => {
      const retRow: DataKey[] = [];
      if (row.metaTableProps) {
        [row.metaTableProps.filter, row.metaTableProps.globalFilter]
          .filter(Boolean)
          .forEach(filter => {
            if (typeof filter === 'string') {
              const regexp = new RegExp(DATA_KEY_REGEXP);
              let result;
              while (result = regexp.exec(filter)) { // All ok, use assign here. Not typo
                ret.push(result[1].split('|'));
              }
            }
          });
      }

      if (row.cols) {
        wrapInArray(row.cols).forEach(col => {
          wrapInArray(col.items).forEach(item => {
            if (item.linkEnabled) {
              ret.push(getIdDataKey(item.dataKey));
            }

            if (item.dataKey) {
              ret.push(item.dataKey);
            }
          });
        });
      }

      if (row.tabs) {
        wrapInArrayWithoutNulls(row.tabs).forEach(tab => {
          wrapInArrayWithoutNulls(tab.rows).forEach(rowParser);
        });
      }

      if (row.collapsePanels) {
        row.collapsePanels.forEach(collapse => {
          wrapInArrayWithoutNulls(collapse.rows).forEach(rowParser);
        });
      }

      return retRow;
    };

    await Promise.all(schema.title.map(async t => {
      const cols = await Promise.all<string>(t.id
        .split('|')
        .filter(id => !isNaN(id as unknown as number) || !isValidUuid(id))
        .map(async (id, index, array) => {
          const columnInfo = await ColumnInfoManager.getById(id);
          if (array.length !== index + 1) {
            const tableInfo = await getReferencedTableInfo(columnInfo);

            return `${camelCase(tableInfo.tableName)}By${capitalize(camelCase(columnInfo.columnName))}`;
          }

          return camelCase(columnInfo.columnName);
        }),
      );
      ret.push(cols);
    }));

    schema.rows.forEach(rowParser);

    return ret;
  }

  @autobind
  private onUpdateButtonClicked(): void {
    // noinspection JSIgnoredPromiseFromCall
    this.updateData();
  }

}
