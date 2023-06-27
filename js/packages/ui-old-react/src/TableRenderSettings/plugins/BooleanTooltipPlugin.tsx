import * as React from 'react';
import {Input, Tooltip} from "@sui/deps-antd";
import {ColumnInfo} from "@sui/ui-old-core";

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

export interface IBooleanTooltipPluginTRP {
  textTrue?: string;
  textFalse?: string;
}

export class BooleanTooltipPlugin extends TableRenderParamsPlugin<IBooleanTooltipPluginTRP> {

  public constructor() {
    super('BooleanTooltipFormatter', 'Логический с подсказкой', true);
  }

  baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<IBooleanTooltipPluginTRP>): Promise<void> {
    const {textTrue, textFalse} = trp;
    result.render = (value: boolean): React.ReactNode => {
      if (!textTrue && !textFalse) {
        return booleanRender(value);
      }

      return (
        <Tooltip
          title={(typeof (value) === "boolean")
            ? value
              ? textTrue
              : textFalse
            : "" }
        >
          {booleanRender(value)}
        </Tooltip>
      );
    };

    return Promise.resolve();
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IBooleanTooltipPluginTRP>): React.ReactNode {
    return (
      <>
        <span>Текст true:</span>
        <Input
          value={trsp.state.tableRenderParams.textTrue || undefined}
          onChange={(e): Promise<void> => trsp.updateField('textTrue')(e.target.value)}
        />
        <span>Текст false:</span>
        <Input
          value={trsp.state.tableRenderParams.textFalse || undefined}
          onChange={(e): Promise<void> => trsp.updateField('textFalse')(e.target.value)}
        />
      </>
    )
  }
}

TableRenderSettingsPluginManager.register(new BooleanTooltipPlugin());
