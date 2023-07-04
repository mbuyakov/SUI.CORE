import React from "react";
import BugReportIcon from "@mui/icons-material/BugReport";
import {useTheme} from "@mui/material/styles";
import axios from "axios";
import {notification} from "@sui/deps-antd";
import moment from "moment";
import {getSUISettings} from "@sui/ui-old-core";
import {IMaterialDropdownItem, MaterialDropdown} from "@/Material";
import {downloadFile} from "@/utils";
import {getUser} from "@sui/lib-auth";

export const FooterAdditionalActions: React.FC = () => {
  const theme = useTheme();

  const items: IMaterialDropdownItem[] = [];

  items.push({
    key: "refreshMeta",
    text: "Обновить метахсему",
    onClick: () => axios.get(
      getSUISettings().metaschemaRefreshUrl,
      {headers: {"Authorization": `Bearer ${getUser().accessToken}`}}
    )
  });

  if (getSUISettings().metaschemaExportUrl) {
    items.push({
      key: "exportMeta",
      text: "Выгрузить метахсему",
      onClick: () => axios.get(
        getSUISettings().metaschemaExportUrl,
        {headers: {Authorization: `Bearer ${getUser().accessToken}`}}
      )
        .then(data => downloadFile(new Blob([data.data]), `metaschema-${moment().format("YYYY-MM-DDTHH_mm_ss")}.sql`))
    });
  }

  if (getSUISettings().dropUserSettingsUrl) {
    items.push({
      key: "dropUserSettings",
      text: "Сбросить настройки пользователя",
      onClick: () => axios.get(
        getSUISettings().dropUserSettingsUrl,
        {
          headers: {Authorization: `Bearer ${getUser().accessToken}`},
          params: {userId: getUser().id}
        }
      )
        .then(() => notification.success({message: "Текущие настройки пользователя успешно сброшены"}))
    });
  }

  return (<MaterialDropdown
    iconButtonProps={{
      children: (<BugReportIcon/>),
      size: "small",
      style: {
        color: theme.palette.text.disabled
      }
    }}
    items={items}
  />);
};
