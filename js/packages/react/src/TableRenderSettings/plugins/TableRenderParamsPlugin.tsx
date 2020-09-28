import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Tooltip } from 'antd';
import * as React from 'react';
import { ColumnInfo } from '@sui/core';

import { IBaseTableColLayout } from '../../BaseTable';
import { IColumnInfoToBaseTableColProps } from '../../utils';
import { ITableRenderParams, TableRenderSettingsPopover } from '../TableRenderSettingsPopover';

export abstract class TableRenderParamsPlugin<T> {

  public readonly hasSettings: boolean;
  public readonly hidden: boolean;
  public readonly id: string;
  public readonly title: string;

  protected constructor(id: string, title: string, hasSettings: boolean, hidden: boolean = false) {
    this.id = id;
    this.title = title;
    this.hasSettings = hasSettings;
    this.hidden = hidden;
  }

  public abstract async baseTableColGenerator(
    result: IBaseTableColLayout,
    renderColumnInfo: ColumnInfo | null,
    props: IColumnInfoToBaseTableColProps,
    tableRenderParams: ITableRenderParams<T>,
  ): Promise<void>

  // For link
public extraActivationKostyl(
// @ts-ignore
    result: IBaseTableColLayout,
// @ts-ignore
    renderColumnInfo: ColumnInfo | null,
// @ts-ignore
    props: IColumnInfoToBaseTableColProps,
// @ts-ignore
    tableRenderParams: ITableRenderParams<T>,
  ): boolean {
    return false;
  }

// @ts-ignore
public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<T>): React.ReactNode {
    return (
      <Tooltip
        title="Для данного режима нет настроек"
      >
        <LegacyIcon
          style={{ transform: 'scale(1.5)' }}
          type="warning"
          theme="twoTone"
          twoToneColor="#ad4e00"
        />
      </Tooltip>
    );
  }

public parseParams(tableRenderParams: ITableRenderParams<T>): ITableRenderParams<T> {
    return tableRenderParams;
  }
}
