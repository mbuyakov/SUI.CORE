import {InputNumber} from 'antd';
import Checkbox from 'antd/lib/checkbox';
import Input from 'antd/lib/input';
import * as React from 'react';

import {IBaseTableColLayout} from '../../BaseTable';
import {ColumnInfo} from '../../cache';
import {getLevelColor} from '../../color';
import {SparkLine} from '../../SparkLine';
import {IColumnInfoToBaseTableColProps} from '../../utils';
import {TableRenderSettingsPluginManager} from '../TableRenderSettingsPluginManager';
import {ITableRenderParams, TableRenderSettingsPopover} from '../TableRenderSettingsPopover';

import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';


export class SparklinePlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('sparkline', 'Спарклайн', false);
  }

public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams): Promise<void> {
result.render = (value: any, _: any, col: any): React.ReactNode =>
      value != null
        ? (
          <SparkLine
            value={value}
          />
        ) : null;
  }
}

TableRenderSettingsPluginManager.register(new SparklinePlugin());
