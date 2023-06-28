import {ColumnInfo} from "@sui/ui-old-core";

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
export class RawPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super("raw", "По умолчанию", false);
  }

  public async baseTableColGenerator(): Promise<void> {
    return;
  }

  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, _props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams): boolean {
    return /*!props.columnInfo.id === props.tableInfo.linkColumnInfoId &&*/  !tableRenderParams || !tableRenderParams.renderType || tableRenderParams.renderType === "raw";
  }
}

TableRenderSettingsPluginManager.register(new RawPlugin());
