/* tslint:disable:no-magic-numbers */
import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import React from "react";

export interface IResetUserSettingsPluginProps {
  onClick(getters: Getters): void | Promise<void>;
}

export function ResetUserSettingsPlugin(props: IResetUserSettingsPluginProps): JSX.Element {
  return (
    <Plugin>
      <Template name="toolbarContent">
        <TemplatePlaceholder/>
        <TemplateConnector>
          {(getters: Getters): JSX.Element => {
            const onClick = (): void | Promise<void> => props.onClick(getters);

            return (
              <Tooltip
                title="Сбросить таблицу к виду по умолчанию"
                placement="bottom"
                enterDelay={300}
              >
                <IconButton onClick={onClick} size="large">
                  <RotateLeftIcon/>
                </IconButton>
              </Tooltip>
            );
          }}
        </TemplateConnector>
      </Template>
    </Plugin>
  );
}
