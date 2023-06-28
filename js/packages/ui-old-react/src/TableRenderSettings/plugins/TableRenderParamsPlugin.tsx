/* eslint-disable @typescript-eslint/no-unused-vars */
import {WarningTwoTone} from "@ant-design/icons";
import {ColumnInfo} from "@sui/ui-old-core";
import {Tooltip} from "@sui/deps-antd";
import * as React from "react";

// noinspection ES6PreferShortImport
import {IBaseTableColLayout} from "../../BaseTable";
// noinspection ES6PreferShortImport
import {IColumnInfoToBaseTableColProps} from "../../utils";
// noinspection ES6PreferShortImport
import {ITableRenderParams, TableRenderSettingsPopover} from "../TableRenderSettingsPopover";

export abstract class TableRenderParamsPlugin<T> {

  public readonly hasSettings: boolean;
  public readonly hidden: boolean;
  public readonly useInSubtotal: boolean;
  public readonly id: string;
  public readonly title: string;

  protected constructor(id: string, title: string, hasSettings: boolean, useInSubtotal: boolean = false, hidden: boolean = false) {
    this.id = id;
    this.title = title;
    this.hasSettings = hasSettings;
    this.hidden = hidden;
    this.useInSubtotal = useInSubtotal;
  }

  public abstract baseTableColGenerator(
    result: IBaseTableColLayout,
    renderColumnInfo: ColumnInfo | null,
    props: IColumnInfoToBaseTableColProps,
    tableRenderParams: ITableRenderParams<T>,
  ): Promise<void>;

  // For link
  public extraActivationKostyl(
    result: IBaseTableColLayout,
    renderColumnInfo: ColumnInfo | null,
    props: IColumnInfoToBaseTableColProps,
    tableRenderParams: ITableRenderParams<T>,
  ): boolean {
    return false;
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<T>): React.ReactNode {
    return (
      <Tooltip
        title="Для данного режима нет настроек"
      >
        <WarningTwoTone
          style={{transform: "scale(1.5)"}}
          twoToneColor="#ad4e00"
        />
      </Tooltip>
    );
  }

  public parseParams(tableRenderParams: ITableRenderParams<T>): ITableRenderParams<T> {
    return tableRenderParams;
  }

  public formatSubtotal(value: unknown, tableRenderParams: ITableRenderParams<T>): string {
    return "Кажется, метод забыли переопределить(";
  }

}
