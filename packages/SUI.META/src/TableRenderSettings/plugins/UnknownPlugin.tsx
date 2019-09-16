import { IBaseTableColLayout } from '@smsoft/sui-base-components';
import { Icon, Tooltip } from 'antd';
import * as React from 'react';

import { ColumnInfo } from '../../cache';
import { IColumnInfoToBaseTableColProps } from '../../utils';
import { ITableRenderParams } from '../TableRenderSettingsPopover';

import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';

export class UnknownPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('unk', '-- Неизвестно --', false);
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): Promise<void> {
    result.render = (): JSX.Element => (
      <Tooltip
        title={`Неизвестный режим ${tableRenderParams.renderType}`}
      >
        <Icon
          style={{ transform: 'scale(1.5)' }}
          type="warning"
          theme="twoTone"
          twoToneColor="#ad4e00"
        />
      </Tooltip>
    );
  }
}
