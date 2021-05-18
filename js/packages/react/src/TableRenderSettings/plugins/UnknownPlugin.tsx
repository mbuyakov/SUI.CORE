import {IBaseTableColLayout} from '@/BaseTable';
import {ITableRenderParams, TableRenderParamsPlugin, TableRenderSettingsPluginManager} from '@/TableRenderSettings';
import {IColumnInfoToBaseTableColProps} from '@/utils';
import {WarningTwoTone} from '@ant-design/icons';
import {ColumnInfo} from "@sui/core";
import {Tooltip} from 'antd';
import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
export class UnknownPlugin extends TableRenderParamsPlugin<{}> {

  public constructor() {
    super('unk', '-- Неизвестно --', false, false, true);
  }

  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): Promise<void> {
    result.render = (): JSX.Element => (
      <Tooltip
        title={`Неизвестный режим ${tableRenderParams.renderType}`}
      >
        <WarningTwoTone
          style={{transform: 'scale(1.5)'}}
          twoToneColor="#ad4e00"
        />
      </Tooltip>
    );
  }

  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): boolean {
    return tableRenderParams && !!tableRenderParams.renderType && !TableRenderSettingsPluginManager.plugins.has(tableRenderParams.renderType);
  }

}

TableRenderSettingsPluginManager.register(new UnknownPlugin());
