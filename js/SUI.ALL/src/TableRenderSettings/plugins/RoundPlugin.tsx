import { InputNumber } from 'antd';
import * as React from 'react';

import { IBaseTableColLayout } from '../../BaseTable';
import { ColumnInfo } from '../../cache';
import { IColumnInfoToBaseTableColProps } from '../../utils';
import { TableRenderSettingsPluginManager } from '../TableRenderSettingsPluginManager';
import { ITableRenderParams, TableRenderSettingsPopover } from '../TableRenderSettingsPopover';

import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';


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
}

TableRenderSettingsPluginManager.register(new RoundPlugin());
