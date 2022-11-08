import * as React from 'react';
import {Input, Tooltip} from "antd";
import {ColumnInfo} from "@sui/core";
import {formatByMaskFn} from "@/tmp";

// noinspection ES6PreferShortImport
import {booleanRender, IBaseTableColLayout} from '../../BaseTable';
// noinspection ES6PreferShortImport
import {IColumnInfoToBaseTableColProps} from '../../utils';
// noinspection ES6PreferShortImport
import {TableRenderSettingsPluginManager} from '../TableRenderSettingsPluginManager';
// noinspection ES6PreferShortImport
import {ITableRenderParams, TableRenderSettingsPopover} from '../TableRenderSettingsPopover';

// noinspection ES6PreferShortImport
import {TableRenderParamsPlugin} from './TableRenderParamsPlugin';

export interface ITooltipPluginTRP {
  text?: string;
}

export class TooltipPlugin extends TableRenderParamsPlugin<ITooltipPluginTRP> {

  public constructor() {
    super('TooltipFormatter', 'Форматирование с подсказкой', true);
  }

  baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<ITooltipPluginTRP>): Promise<void> {
    const {text} = trp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.render = (value: any): React.ReactNode => {
      if (!value && !text) {
        return value;
      }

      return (
        <Tooltip
          title={text}
        >
          {typeof (value) === "boolean" ? booleanRender(value) : value}
        </Tooltip>
      );
    };

    return Promise.resolve();
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<ITooltipPluginTRP>): React.ReactNode {
    return (
      <>
        <span>Текст:</span>
        <Input
          value={trsp.state.tableRenderParams.text || undefined}
          onChange={(e): Promise<void> => trsp.updateField('text')(e.target.value)}
        />
      </>
    )
  }
}

TableRenderSettingsPluginManager.register(new TooltipPlugin());
