import {IBaseTableColLayout} from '@/BaseTable';
import {TableRenderParamsPlugin, TableRenderSettingsPluginManager} from '@/TableRenderSettings';
import {IColumnInfoToBaseTableColProps} from '@/utils';
import {ColumnInfo} from "@sui/core";
import {InputNumber} from 'antd';
import * as React from 'react';

import {ITableRenderParams, TableRenderSettingsPopover} from '../TableRenderSettingsPopover';

export interface IRoundPluginTRP {
  roundCount?: number;
}

export class RoundPlugin extends TableRenderParamsPlugin<IRoundPluginTRP> {

  public constructor() {
    super('round', 'Округление', true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  public formatSubtotal(value: unknown, tableRenderParams: ITableRenderParams<IRoundPluginTRP>): string {
    const roundCount = tableRenderParams.roundCount;
    return (Number.isInteger(value))
      ? String(value)
      : Number((value as number).toFixed(typeof(roundCount) === "number" ? roundCount : 4)).toString();
  }
}

TableRenderSettingsPluginManager.register(new RoundPlugin());
