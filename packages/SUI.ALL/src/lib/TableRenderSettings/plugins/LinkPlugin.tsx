import camelCase from 'lodash/camelCase';
import * as React from 'react';

import { IBaseTableColLayout } from '../../BaseTable';
import {ColumnInfo} from '../../cache';
import { getDataByKey } from '../../dataKey';
import { RouterLink } from '../../Link';
import {getLinkForTable, getReferencedTableInfo, IColumnInfoToBaseTableColProps} from '../../utils';
import {TableRenderSettingsPluginManager} from '../TableRenderSettingsPluginManager';
import {ITableRenderParams} from '../TableRenderSettingsPopover';

import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';


export class LinkPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('link', 'Ссылка', false);
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, _tableRenderParams: ITableRenderParams): Promise<void> {

    const referencedTableInfo = props.isLinkCol
      ? props.tableInfo
      : await getReferencedTableInfo(props.columnInfo);

    if (!referencedTableInfo) {
      return;
    }

    const link = getLinkForTable(referencedTableInfo.tableName, 'card', ':id');
    if (link) {
      // tslint:disable-next-line:no-any
      result.render = (value: any, row: any): JSX.Element => value && (
        <RouterLink
          to={link.replace(
            ':id',
            props.isLinkCol
              ? row.id
              : result.dataKey
              ? row[camelCase(props.columnInfo.columnName)]
              : value,
          )}
          text={value}
          type="button"
          monospace={false}
        />
      );
    }
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name
  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): boolean {
    const isLinkCol = props.columnInfo.id === props.tableInfo.linkColumnInfoId;
    if (isLinkCol && tableRenderParams && (!tableRenderParams.renderType || tableRenderParams.renderType === 'link' || tableRenderParams.renderType === 'raw')) {
      return true;
    }

    if (tableRenderParams && tableRenderParams.renderType && tableRenderParams.renderType !== 'link') {
      return false;
    }

    return getDataByKey(props.columnInfo, "foreignColumnInfo", "length")
      ? tableRenderParams.renderType === 'link'
      : props.columnInfo.id === props.tableInfo.linkColumnInfoId;
  }
}

TableRenderSettingsPluginManager.register(new LinkPlugin());