import {ColumnInfo, ColumnInfoManager, getDataByKey} from "@sui/ui-old-core";
import {Select} from "@sui/deps-antd";
import * as React from "react";
import {RouterLink} from "@/Link";
import {IBaseTableColLayout} from "@/BaseTable";

// noinspection ES6PreferShortImport
import {getLinkForTable, getReferencedTableInfo, IColumnInfoToBaseTableColProps} from "../../utils";
// noinspection ES6PreferShortImport
import {TableRenderSettingsPluginManager} from "../TableRenderSettingsPluginManager";
// noinspection ES6PreferShortImport
import {ITableRenderParams, TableRenderSettingsPopover} from "../TableRenderSettingsPopover";

// noinspection ES6PreferShortImport
import {TableRenderParamsPlugin} from "./TableRenderParamsPlugin";

export interface ILinkPluginTRP {
  customColumnInfoId: string
}

export class LinkPlugin extends TableRenderParamsPlugin<ILinkPluginTRP> {
  public constructor() {
    super("link", "Ссылка", true);
  }

  public async baseTableColGenerator(result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams<ILinkPluginTRP>): Promise<void> {
    const customColumnInfo = tableRenderParams.customColumnInfoId && (await ColumnInfoManager.getById(tableRenderParams.customColumnInfoId));

    const referencedTableInfo = props.isLinkCol
      ? props.tableInfo
      : customColumnInfo
        ? await getReferencedTableInfo(customColumnInfo)
        : await getReferencedTableInfo(props.columnInfo);

    if (!referencedTableInfo) {
      return;
    }


    const link = getLinkForTable(referencedTableInfo.tableName, "card", ":id");
    if (link) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.render = (value: any, row: any): React.ReactNode => {
        if (value || value === 0) {
          const id = customColumnInfo
            ? row[customColumnInfo.columnName]
            : props.isLinkCol
              ? row.id
              : result.dataKey
                ? row[props.columnInfo.columnName]
                : value;

          if (id || id === 0) {
            return (
              <RouterLink
                to={link.replace(":id", id)}
                text={value}
                type="button"
                monospace={false}
              />
            );
          }
        }

        return value;
      };
    }
  }

  public extraActivationKostyl(_result: IBaseTableColLayout, _renderColumnInfo: ColumnInfo | null, props: IColumnInfoToBaseTableColProps, tableRenderParams: ITableRenderParams<ILinkPluginTRP>): boolean {
    const isLinkCol = props.isLinkCol;
    const renderType = getDataByKey<string>(tableRenderParams, "renderType");

    if (isLinkCol && (!renderType || renderType === "link" || renderType === "raw")) {
      return true;
    }

    return renderType === "link" && getDataByKey(props.columnInfo, "foreignColumnInfo", "length");
  }


  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<ILinkPluginTRP>): React.ReactNode {
    const columns = trsp.props.tableInfo.columnInfosByTableInfoId.nodes;

    return (
      <>
        <span>Колонка с id:</span>
        <Select
          style={{minWidth: 250}}
          value={trsp.state.tableRenderParams.customColumnInfoId || undefined}
          onChange={trsp.updateField("customColumnInfoId")}
          allowClear={true}
        >
          {columns.map(column => (<Select.Option key={column.id} value={column.id}>{column.nameByNameId ? column.nameByNameId.name : column.columnName}</Select.Option>))}
        </Select>
      </>
    );
  }
}

TableRenderSettingsPluginManager.register(new LinkPlugin());
