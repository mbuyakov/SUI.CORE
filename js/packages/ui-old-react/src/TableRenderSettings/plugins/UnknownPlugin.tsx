import {WarningTwoTone} from "@ant-design/icons";
import {ColumnInfo} from "@sui/ui-old-core";
import {Tooltip} from "@sui/deps-antd";
import * as React from "react";

// noinspection ES6PreferShortImport
import {IBaseTableColLayout} from "../../BaseTable";
// noinspection ES6PreferShortImport
import {IColumnInfoToBaseTableColProps} from "../../utils";
// noinspection ES6PreferShortImport
import {TableRenderSettingsPluginManager} from "../TableRenderSettingsPluginManager";
// noinspection ES6PreferShortImport
import {ITableRenderParams} from "../TableRenderSettingsPopover";

// noinspection ES6PreferShortImport
import {TableRenderParamsPlugin} from "./TableRenderParamsPlugin";

// eslint-disable-next-line @typescript-eslint/ban-types
export class UnknownPlugin extends TableRenderParamsPlugin<{}> {

  public constructor() {
    super("unk", "-- Неизвестно --", false, false, true);
  }

  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): Promise<void> {
    result.render = (): JSX.Element => (
      <Tooltip
        title={`Неизвестный режим ${tableRenderParams.renderType}`}
      >
        <WarningTwoTone
          style={{transform: "scale(1.5)"}}
          twoToneColor="#ad4e00"
        />
      </Tooltip>
    );
  }

  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): boolean {
    return tableRenderParams && !!tableRenderParams.renderType && !TableRenderSettingsPluginManager.plugins.has(tableRenderParams.renderType);
  }

}

TableRenderSettingsPluginManager.register(new UnknownPlugin());
