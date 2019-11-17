/* tslint:disable:jsx-no-lambda */
import { Checkbox, Input } from 'antd';
import moment from 'moment';
import * as React from 'react';

import {IBaseTableColLayout} from "../BaseTable";
import {ColumnInfo} from "../cache";
import {ITableRenderParams, TableRenderSettingsPopover} from "../TableRenderSettings";
import {TableRenderParamsPlugin} from "../TableRenderSettings/plugins";
import {IColumnInfoToBaseTableColProps} from "../utils";


export interface IDateFormatterPluginTRP {
  convertFromUtc?: boolean;
  sourceFormat?: string;
  targetFormat?: string;
}

export class DateFormatterPlugin extends TableRenderParamsPlugin<IDateFormatterPluginTRP> {

  public constructor() {
    super('dateFormatter', 'Форматирование даты/времени', true);
  }

  // tslint:disable-next-line:prefer-function-over-method variable-name no-async-without-await
  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, trp: ITableRenderParams<IDateFormatterPluginTRP>): Promise<void> {
    result.render = (value: string) => {
      if(!value) {
        return "";
      }
      const momentCreator = trp.convertFromUtc ? moment.utc : moment;
      let momentValue = momentCreator(value, trp.sourceFormat);
      if(trp.convertFromUtc) {
        momentValue = momentValue.local();
      }

      return momentValue.format(trp.targetFormat);
    };

    return;
  }

  // tslint:disable-next-line:prefer-function-over-method
  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IDateFormatterPluginTRP>): React.ReactNode {
    return (
      <>
        <span>Исходный формат:</span>
        <Input
          value={trsp.state.tableRenderParams.sourceFormat || undefined}
          onChange={e => trsp.updateField('sourceFormat')(e.target.value)}
        />
        <span>Целевой формат:</span>
        <Input
          value={trsp.state.tableRenderParams.targetFormat || undefined}
          onChange={e => trsp.updateField('targetFormat')(e.target.value)}
        />
        <span>Конвертировать из UTC?</span>
        <Checkbox
          checked={trsp.state.tableRenderParams.convertFromUtc || undefined}
          onChange={e => trsp.updateField('convertFromUtc')(e.target.checked)}
        />
      </>
    );
  }

}
