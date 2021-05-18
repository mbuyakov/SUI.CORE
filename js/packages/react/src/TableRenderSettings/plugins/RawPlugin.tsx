import {IBaseTableColLayout} from '@/BaseTable';
import {ITableRenderParams, TableRenderParamsPlugin, TableRenderSettingsPluginManager} from '@/TableRenderSettings';
import {IColumnInfoToBaseTableColProps} from '@/utils';
import {ColumnInfo} from "@sui/core";

// eslint-disable-next-line @typescript-eslint/ban-types
export class RawPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('raw', 'По умолчанию', false);
  }

public async baseTableColGenerator(): Promise<void> {
    return;
  }

public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): boolean {
    return /*!props.columnInfo.id === props.tableInfo.linkColumnInfoId &&*/  !tableRenderParams || !tableRenderParams.renderType || tableRenderParams.renderType === 'raw';
  }
}

TableRenderSettingsPluginManager.register(new RawPlugin());
