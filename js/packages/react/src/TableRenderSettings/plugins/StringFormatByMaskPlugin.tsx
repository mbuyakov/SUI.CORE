import * as React from 'react';
import {Input} from "antd";
import {ITableRenderParams, TableRenderParamsPlugin, TableRenderSettingsPluginManager, TableRenderSettingsPopover} from "@/TableRenderSettings";
import {IBaseTableColLayout} from "@/BaseTable";
import {IColumnInfoToBaseTableColProps} from "@/utils";
import {formatByMaskFn} from "@/tmp";

export interface IStringFormatByMaskPluginTRP {
  mask?: string;
}

export class StringFormatByMaskPlugin extends TableRenderParamsPlugin<IStringFormatByMaskPluginTRP> {

  public constructor() {
    super('stringByMaskFormatter', 'Форматирование строки по маске', true);
  }

  baseTableColGenerator(result: IBaseTableColLayout, renderColumnInfo: | null, props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<IStringFormatByMaskPluginTRP>): Promise<void> {
    const {mask} = trp;
    result.render = (value: string): React.ReactNode => {
      if (!value && !mask) {
        return value;
      }

      return formatByMaskFn(mask)(value);
    };

    return;
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IStringFormatByMaskPluginTRP>): React.ReactNode {
    return (
      <>
        <span>Маска:</span>
        <Input
          value={trsp.state.tableRenderParams.mask || undefined}
          onChange={(e): Promise<void> => trsp.updateField('mask')(e.target.value)}
        />
      </>
    )
  }
}

TableRenderSettingsPluginManager.register(new StringFormatByMaskPlugin());
