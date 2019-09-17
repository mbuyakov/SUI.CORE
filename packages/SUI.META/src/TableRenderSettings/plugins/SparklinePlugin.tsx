/* tslint:disable:jsx-no-lambda */
import { IBaseTableColLayout, SparkLine } from '@smsoft/sui-base-components';
import { getLevelColor } from '@smsoft/sui-core';
import { InputNumber } from 'antd';
import Checkbox from 'antd/lib/checkbox';
import Input from 'antd/lib/input';
import * as React from 'react';

import { ColumnInfo } from '../../cache';
import { IColumnInfoToBaseTableColProps } from '../../utils';
import { TableRenderSettingsPluginManager } from '../TableRenderSettingsPluginManager';
import { ITableRenderParams, TableRenderSettingsPopover } from '../TableRenderSettingsPopover';

import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';

export class SparklinePlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('sparkline', 'Спарклайн', true);
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name no-async-without-await
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams): Promise<void> {
    // tslint:disable-next-line:no-any
    result.render = (value: any, _: any, col: any): JSX.Element => (
      <SparkLine
        min={trp.sparklineMin}
        max={trp.sparklineMax}
        value={value}
        // tslint:disable-next-line:no-magic-numbers
        width={col.width - 20}
        color={typeof trp.color === 'boolean' ? getLevelColor((value - (trp.sparklineMin || 0)) / (trp.sparklineMax || 100) * 100) : (trp.color || '#F00')}
      />
    );
  }

  // tslint:disable-next-line:prefer-function-over-method
  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<{}>): React.ReactNode {
    return (
      <>
        <span>Минимум:</span>
        <InputNumber
          placeholder="0"
          value={trsp.state.tableRenderParams.sparklineMin || undefined}
          onChange={trsp.updateField('sparklineMin')}
        />
        <span>Максимум:</span>
        <InputNumber
          placeholder="100"
          value={trsp.state.tableRenderParams.sparklineMax || undefined}
          onChange={trsp.updateField('sparklineMax')}
        />
        <span>Цвет:</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content' }}>
          <Checkbox
            checked={(typeof trsp.state.tableRenderParams.color === 'boolean') ? trsp.state.tableRenderParams.color : false}
            onChange={e => trsp.updateField('color')(e.target.checked)}
          >
            Автоматический подбор
          </Checkbox>
          <Input
            style={{ maxWidth: 200 }}
            placeholder={(typeof trsp.state.tableRenderParams.color === 'boolean' && trsp.state.tableRenderParams.color) ? '' : '#F00'}
            value={(typeof trsp.state.tableRenderParams.color === 'boolean') ? '' : trsp.state.tableRenderParams.color}
            disabled={trsp.state.tableRenderParams.color === true}
            onChange={e => trsp.updateField('color')(e.target.value)}
          />
        </div>
      </>
    );
  }
}

TableRenderSettingsPluginManager.register(new SparklinePlugin());
