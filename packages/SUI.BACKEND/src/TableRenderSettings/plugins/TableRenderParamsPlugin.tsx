import { IBaseTableColLayout } from '@smsoft/sui-base-components/src';
import { ColumnInfo, IColumnInfoToBaseTableColProps } from '@smsoft/sui-meta';
import { Icon, Tooltip } from 'antd';
import * as React from 'react';

import { ITableRenderParams, TableRenderSettingsPopover } from '../TableRenderSettingsPopover';

export abstract class TableRenderParamsPlugin<T> {

  public readonly hasSettings: boolean;
  public readonly id: string;
  public readonly title: string;

  protected constructor(id: string, title: string, hasSettings: boolean) {
    this.id = id;
    this.title = title;
    this.hasSettings = hasSettings;
  }

  public abstract async baseTableColGenerator(
    result: IBaseTableColLayout,
    renderColumnInfo: ColumnInfo | null,
    props: IColumnInfoToBaseTableColProps,
    tableRenderParams: ITableRenderParams<T>,
  ): Promise<void>

  // For link
  // tslint:disable-next-line:prefer-function-over-method ban-ts-ignore
  public extraActivationKostyl(
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    result: IBaseTableColLayout,
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    renderColumnInfo: ColumnInfo | null,
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    props: IColumnInfoToBaseTableColProps,
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    tableRenderParams: ITableRenderParams<T>,
  ): boolean {
    return false;
  }

  // tslint:disable-next-line:ban-ts-ignore
  // @ts-ignore
  // tslint:disable-next-line:prefer-function-over-method
  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<T>): React.ReactNode {
    return (
      <Tooltip
        title="Для данного режима нет настроек"
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

  // tslint:disable-next-line:prefer-function-over-method
  public parseParams(tableRenderParams: ITableRenderParams<T>): ITableRenderParams<T> {
    return tableRenderParams;
  }
}
