import {IBaseTableColLayout} from '@/BaseTable';
import {SparkLine} from '@/SparkLine';
import {ITableRenderParams, TableRenderParamsPlugin, TableRenderSettingsPluginManager} from '@/TableRenderSettings';
import {IColumnInfoToBaseTableColProps} from '@/utils';
import {ColumnInfo} from '@sui/core';
import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
export class SparklinePlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('sparkline', 'Спарклайн', false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.render = (value: any): React.ReactNode => value != null ? (<SparkLine value={value}/>) : null;
  }

}

TableRenderSettingsPluginManager.register(new SparklinePlugin());
