/* tslint:disable:no-magic-numbers */
import {MuiIcons, IconButton, Tooltip} from "@sui/deps-material";
import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import React from "react";

export interface IResetUserSettingsPluginProps {
  onClick(getters: Getters): void | Promise<void>;
}

export function ResetUserSettingsPlugin(props: IResetUserSettingsPluginProps): React.JSX.Element {
  return (
    <Plugin>
      <Template name="toolbarContent">
        <TemplatePlaceholder/>
        <TemplateConnector>
          {(getters: Getters): React.JSX.Element => {
            const onClick = (): void | Promise<void> => props.onClick(getters);

            return (
              <Tooltip
                title="Сбросить таблицу к виду по умолчанию"
                placement="bottom"
                enterDelay={300}
              >
                <IconButton onClick={onClick} size="large">
                  <MuiIcons.RotateLeft/>
                </IconButton>
              </Tooltip>
            );
          }}
        </TemplateConnector>
      </Template>
    </Plugin>
  );
}
