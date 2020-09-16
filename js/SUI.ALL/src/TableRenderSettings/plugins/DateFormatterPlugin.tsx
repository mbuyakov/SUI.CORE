import { Checkbox, Input } from 'antd';
import moment from 'moment';
import * as React from 'react';

import { IBaseTableColLayout } from '../../BaseTable';
import { ColumnInfo } from '../../cache';
import { IColumnInfoToBaseTableColProps } from '../../utils';
import { TableRenderSettingsPluginManager } from '../TableRenderSettingsPluginManager';
import { ITableRenderParams, TableRenderSettingsPopover } from '../TableRenderSettingsPopover';

import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';


export interface IDateFormatterPluginTRP {
  convertFromUtc?: boolean;
  filterFormat?: string;
  sourceFormat?: string;
  targetFormat?: string;
}

export class DateFormatterPlugin extends TableRenderParamsPlugin<IDateFormatterPluginTRP> {

  public constructor() {
    super('dateFormatter', 'Форматирование даты/времени', true);
  }

public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<IDateFormatterPluginTRP>): Promise<void> {
    const {convertFromUtc, filterFormat, sourceFormat, targetFormat} = trp;

    result.render = (value: string): React.ReactNode => {
      if (!value) {
        return value;
      }

      const momentCreator = convertFromUtc ? moment.utc : moment;
      let momentValue = momentCreator(value, sourceFormat);

      if (convertFromUtc) {
        momentValue = momentValue.local();
      }

      return momentValue.format(targetFormat);
    };

    if (result.search) {
      result.search = {
        format: filterFormat || targetFormat,
        type: "date"
      }
    }

    return;
  }

public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IDateFormatterPluginTRP>): React.ReactNode {
    return (
      <>
        <span>Исходный формат:</span>
        <Input
          value={trsp.state.tableRenderParams.sourceFormat || undefined}
          onChange={(e): Promise<void> => trsp.updateField('sourceFormat')(e.target.value)}
        />
        <span>Целевой формат:</span>
        <Input
          value={trsp.state.tableRenderParams.targetFormat || undefined}
          onChange={(e): Promise<void> => trsp.updateField('targetFormat')(e.target.value)}
        />
        <span>Формат фильтра:</span>
        <Input
          value={trsp.state.tableRenderParams.filterFormat || undefined}
          onChange={(e): Promise<void> => trsp.updateField('filterFormat')(e.target.value)}
        />
        <span>Конвертировать из UTC?</span>
        <Checkbox
          checked={trsp.state.tableRenderParams.convertFromUtc || undefined}
          onChange={(e): Promise<void> => trsp.updateField('convertFromUtc')(e.target.checked)}
        />
      </>
    );
  }
}

TableRenderSettingsPluginManager.register(new DateFormatterPlugin());
