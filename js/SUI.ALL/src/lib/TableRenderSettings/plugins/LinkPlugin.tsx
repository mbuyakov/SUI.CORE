import {Select} from "antd";
import camelCase from 'lodash/camelCase';
import * as React from 'react';

import { IBaseTableColLayout } from '../../BaseTable';
import {ColumnInfo, ColumnInfoManager} from '../../cache';
import { getDataByKey } from '../../dataKey';
import { RouterLink } from '../../Link';
import {getLinkForTable, getReferencedTableInfo, IColumnInfoToBaseTableColProps} from '../../utils';
import {ITableRenderParams, TableRenderSettingsPopover} from '../TableRenderSettingsPopover';

import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';

export interface ILinkPluginTRP {
  customColumnInfoId: string
}

export class LinkPlugin extends TableRenderParamsPlugin<ILinkPluginTRP> {
  public constructor() {
    super('link', 'Ссылка', true);
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams<ILinkPluginTRP>): Promise<void> {

    // console.warn(await ColumnInfoManager.getById(tableRenderParams.customColumnInfoId));

    const customColumnInfo = tableRenderParams.customColumnInfoId && await ColumnInfoManager.getById(tableRenderParams.customColumnInfoId);

    const referencedTableInfo = customColumnInfo
      ? await getReferencedTableInfo(customColumnInfo)
      : props.isLinkCol
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
            customColumnInfo
              ? row[camelCase(customColumnInfo.columnName)]
              : props.isLinkCol
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
  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams<ILinkPluginTRP>): boolean {
    const isLinkCol = props.isLinkCol;
    const renderType = getDataByKey<string>(tableRenderParams, "renderType");

    if (isLinkCol && (!renderType || renderType === 'link' || renderType === 'raw')) {
      return true;
    }

    return renderType === 'link' && getDataByKey(props.columnInfo, "foreignColumnInfo", "length");
  }


  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<ILinkPluginTRP>): React.ReactNode {
    const columns = trsp.props.tableInfo.columnInfosByTableInfoId.nodes;

    return (
      <>
        <span>Колонка с id:</span>
        <Select
          style={{minWidth: 250}}
          value={trsp.state.tableRenderParams.customColumnInfoId || undefined}
          onChange={trsp.updateField('customColumnInfoId')}
          allowClear={true}
        >
          {columns.map(column => (<Select.Option key={column.id} value={column.id}>{column.nameByNameId ? column.nameByNameId.name : column.columnName}</Select.Option>))}
        </Select>
      </>
    );
  }
}
