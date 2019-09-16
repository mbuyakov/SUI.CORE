import { IBaseTableColLayout, RouterLink } from '@smsoft/sui-base-components';
import camelCase from 'lodash/camelCase';
import * as React from 'react';

import { ColumnInfo } from '../../cache';
import { getLinkForTable, getReferencedTableInfo, IColumnInfoToBaseTableColProps } from '../../utils';
import { ITableRenderParams } from '../TableRenderSettingsPopover';

import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';


export class LinkPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('link', 'Ссылка', false);
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, _tableRenderParams: ITableRenderParams): Promise<void> {
    const link = getLinkForTable(
      props.isLinkCol
        ? props.tableInfo.tableName
        : (await getReferencedTableInfo(props.columnInfo)).tableName, 'card', ':id',
    );
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
    const isIdEqual = props.columnInfo.id === props.tableInfo.linkColumnInfoId;

    return (tableRenderParams ? (tableRenderParams.renderType === "link" || !tableRenderParams.renderType): isIdEqual);
  }
}
