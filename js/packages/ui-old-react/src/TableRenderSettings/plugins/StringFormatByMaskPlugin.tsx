import * as React from 'react';
import {Input} from "antd";
import {ColumnInfo} from "@sui/ui-old-core";
import {formatByMaskFn} from "@/tmp";

// noinspection ES6PreferShortImport
import {IBaseTableColLayout} from '../../BaseTable';
// noinspection ES6PreferShortImport
import {IColumnInfoToBaseTableColProps} from '../../utils';
// noinspection ES6PreferShortImport
import {TableRenderSettingsPluginManager} from '../TableRenderSettingsPluginManager';
// noinspection ES6PreferShortImport
import {ITableRenderParams, TableRenderSettingsPopover} from '../TableRenderSettingsPopover';

// noinspection ES6PreferShortImport
import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';

export interface IStringFormatByMaskPluginTRP {
  mask?: string;
}

export class StringFormatByMaskPlugin extends TableRenderParamsPlugin<IStringFormatByMaskPluginTRP> {

  public constructor() {
    super('stringByMaskFormatter', 'Форматирование строки по маске', true);
  }

  baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<IStringFormatByMaskPluginTRP>): Promise<void> {
    const {mask} = trp;
    result.render = (value: string): React.ReactNode => {
      if (!value && !mask) {
        return value;
      }

      return formatByMaskFn(mask, "")(value);
    };

    return Promise.resolve();
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
