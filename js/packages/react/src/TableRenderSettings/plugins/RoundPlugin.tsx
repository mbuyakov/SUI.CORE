import {InputNumber} from 'antd';
import * as React from 'react';
import {ColumnInfo} from "@sui/core";

import {IBaseTableColLayout} from '../../BaseTable';
import {IColumnInfoToBaseTableColProps} from '../../utils';
import {TableRenderSettingsPluginManager} from '../TableRenderSettingsPluginManager';
import {ITableRenderParams, TableRenderSettingsPopover} from '../TableRenderSettingsPopover';

import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';


export interface IRoundPluginTRP {
  roundCount?: number;
}

export class RoundPlugin extends TableRenderParamsPlugin<IRoundPluginTRP> {

  public constructor() {
    super('round', 'Округление', true);
  }

  public async baseTableColGenerator(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, _trp: ITableRenderParams<IRoundPluginTRP>): Promise<void> {
    return;
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IRoundPluginTRP>): React.ReactNode {
    return (
      <>
        <span>Число знаков:</span>
        <InputNumber
          value={trsp.state.tableRenderParams.roundCount || undefined}
          onChange={trsp.updateField('roundCount')}
        />
      </>
    );
  }

  public formatSubtotal(value: any, tableRenderParams: ITableRenderParams<IRoundPluginTRP>): string {
    const roundCount = tableRenderParams.roundCount;
    return (Number.isInteger(value))
      ? value
      : Number(value.toFixed(typeof(roundCount) === "number" ? roundCount : 4)).toString();
  }
}

TableRenderSettingsPluginManager.register(new RoundPlugin());
