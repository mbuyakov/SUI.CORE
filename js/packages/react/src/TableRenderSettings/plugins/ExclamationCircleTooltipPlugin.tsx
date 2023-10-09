import * as React from 'react';
import {Input, Space, Tooltip} from "antd";
import {ColumnInfo} from "@sui/core";

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
import {ExclamationCircleOutlined} from "@ant-design/icons";

export interface IExclamationCircleTooltipPluginTRP {
  text?: string;
}

export class ExclamationCircleTooltipPlugin extends TableRenderParamsPlugin<IExclamationCircleTooltipPluginTRP> {

  public constructor() {
    super('ExclamationCircleTooltipFormatter', 'Пиктограмма с подсказкой', true);
  }

  baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<IExclamationCircleTooltipPluginTRP>): Promise<void> {
    const {text} = trp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.render = (value: any): React.ReactNode => {
      if (!value && !text) {
        return value;
      }

      return (
        <Space>
          {value}
          <Tooltip
            title={text}
            overlayInnerStyle={{width: "max-content"}}
          >
            {<ExclamationCircleOutlined style={{color: "rgb(86, 203, 248)"}}/>}
          </Tooltip>
        </Space>
      );
    };

    return Promise.resolve();
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IExclamationCircleTooltipPluginTRP>): React.ReactNode {
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

TableRenderSettingsPluginManager.register(new ExclamationCircleTooltipPlugin());
