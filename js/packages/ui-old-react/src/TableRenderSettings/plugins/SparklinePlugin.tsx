import {ColumnInfo} from '@sui/ui-old-core';
import * as React from 'react';

// noinspection ES6PreferShortImport
import {IBaseTableColLayout} from '../../BaseTable';
// noinspection ES6PreferShortImport
import {SparkLine} from '../../SparkLine';
// noinspection ES6PreferShortImport
import {IColumnInfoToBaseTableColProps} from '../../utils';
// noinspection ES6PreferShortImport
import {TableRenderSettingsPluginManager} from '../TableRenderSettingsPluginManager';
// noinspection ES6PreferShortImport
import {ITableRenderParams} from '../TableRenderSettingsPopover';

// noinspection ES6PreferShortImport
import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';

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
