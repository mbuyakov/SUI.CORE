/* eslint-disable @typescript-eslint/no-explicit-any */
import {InfoCircleOutlined} from "@ant-design/icons";
import {ColumnInfo} from "@sui/ui-old-core";
import {Checkbox, Input, Tooltip} from "@sui/deps-antd";
import * as React from "react";

// noinspection ES6PreferShortImport
import {IBaseTableColLayout} from "../../BaseTable";
// noinspection ES6PreferShortImport
import {RouterLink} from "../../Link";
// noinspection ES6PreferShortImport
import {getLinkForTable, IColumnInfoToBaseTableColProps} from "../../utils";
// noinspection ES6PreferShortImport
import {TableRenderSettingsPluginManager} from "../TableRenderSettingsPluginManager";
// noinspection ES6PreferShortImport
import {ITableRenderParams, TableRenderSettingsPopover} from "../TableRenderSettingsPopover";

// noinspection ES6PreferShortImport
import {TableRenderParamsPlugin} from "./TableRenderParamsPlugin";

export interface IMultipleLinkPluginParams {
  linkTableName: string
  limitCount: boolean
}

export class MultipleLinkPlugin extends TableRenderParamsPlugin<IMultipleLinkPluginParams> {
  public constructor() {
    super("multilink", "Множественная ссылка", true);
  }

  public async baseTableColGenerator(result: IBaseTableColLayout,
                                     _renderColumnInfo: ColumnInfo | null,
                                     props: IColumnInfoToBaseTableColProps,
                                     tableRenderParams: ITableRenderParams<IMultipleLinkPluginParams>
  ): Promise<void> {
    const linkTableName = tableRenderParams.linkTableName || " ";
    const linkTemplate = !isBlank(linkTableName) && getLinkForTable(linkTableName, "card", ":id") || null;
    result.render = (value: any): React.JSX.Element => {
      const [isExpanded, setExpanded] = React.useState(false);
      let links = getLinkFromJsonValue(value);
      const linksLength = links.length;
      if (tableRenderParams.limitCount && !isExpanded) {
        links = links.slice(0, 5);
      }
      return (
        <>
          {!!linkTemplate ? links.map(link => (
              <RouterLink
                key={link.id}
                to={linkTemplate.replace(":id", link.id)}
                text={link.name}
                type="button"
                monospace={false}
              />
            ))
            : links.map(link => link.name).filter(name => !!name).join("; ")
          }
          {tableRenderParams.limitCount && linksLength > 5 && (<a style={{whiteSpace: "nowrap"}} onClick={() => setExpanded(!isExpanded)}>{isExpanded ? " скрыть" : " показать все"}</a>)}
        </>
      );
    };

    return Promise.resolve();
  }

  public getSettingsPopoverContent(trsp: TableRenderSettingsPopover<IMultipleLinkPluginParams>): React.ReactNode {
    const onChangeLinkTableName = (event): Promise<void> => trsp.updateField("linkTableName")(event.target.value);

    return (
      <>
        <span>Таблица для ссылок</span>
        <Input
          value={trsp.state.tableRenderParams.linkTableName || ""}
          onChange={onChangeLinkTableName}
          suffix={
            <Tooltip title="Укажите имя таблицы в БД. Если оставить пустым, то вместо ссылок будут отображаться их представления разделенные ;">
              <InfoCircleOutlined style={{color: "rgba(0,0,0,.45)"}}/>
            </Tooltip>
          }
        />
        <span>Ограничить кол-во выводимых значений?</span>
        <Checkbox
          checked={trsp.state.tableRenderParams.limitCount || undefined}
          onChange={(e): Promise<void> => trsp.updateField("limitCount")(e.target.checked)}
        />
      </>
    );
  }
}

function getLinkFromJsonValue(value?: any): Array<{ id: string, name: string }> {
  try {
    const res = value && JSON.parse(value);
    return res || [];
  } catch (e) {
    return [];
  }
}

function isBlank(s: string): boolean {
  return !s || typeof s !== "string" || s.trim() === "";
}

TableRenderSettingsPluginManager.register(new MultipleLinkPlugin());
