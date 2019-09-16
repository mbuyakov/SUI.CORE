import { IBaseTableColLayout } from '@smsoft/sui-base-components';

import { ColumnInfo } from '../../cache';
import { IColumnInfoToBaseTableColProps } from '../../utils';
import { ITableRenderParams } from '../TableRenderSettingsPopover';

import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';

export class RawPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('raw', 'По умолчанию', false);
  }

  // tslint:disable-next-line:prefer-function-over-method
  public async baseTableColGenerator(): Promise<void> {
    return;
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name
  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): boolean {
    return !tableRenderParams || !tableRenderParams.renderType || tableRenderParams.renderType === "raw";
  }
}
