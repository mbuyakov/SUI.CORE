/* tslint:disable:no-magic-numbers */
import {ComputedFn, Getter, Getters, Plugin} from "@sui/deps-dx-react-grid";
import {TableColumnWidthInfo} from "@sui/deps-dx-react-grid";
import autobind from "autobind-decorator";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import React from "react";

export interface IBaseTableUserSettings {
  columnWidths: TableColumnWidthInfo[];
  hiddenColumnNames: string[];
  order: string[];
}

export interface IUserSettingsPluginProps {
  onSettingsChange(settings: IBaseTableUserSettings): void;
}

function generateUserSettings(getters: Getters): IBaseTableUserSettings {
  return {
    columnWidths: getters.fullColumnWidths,
    hiddenColumnNames: getters.hiddenColumnNames || [],
    order: getters.fullOrder,
  };
}

export class UserSettingsPlugin extends React.Component<IUserSettingsPluginProps> {

  private debouncedTriggerChange: (settings: IBaseTableUserSettings) => void = debounce(this.triggerChange, 1000);

  private lastSavedUserSettings: IBaseTableUserSettings;

  public render(): JSX.Element {
    return (
      <Plugin name="UserSettings">
        {/* Watchers */}
        <Getter
          name="tableColumns"
          computed={this.computedForWatcher("tableColumns")}
        />
        <Getter
          name="hiddenColumnNames"
          computed={this.computedForWatcher("hiddenColumnNames")}
        />
      </Plugin>
    );
  }

  @autobind
  private computedForWatcher(property: string): ComputedFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getters): any => {
      const userSettings = generateUserSettings(getters);

      if (!this.lastSavedUserSettings) {
        this.lastSavedUserSettings = userSettings;
      } else if (!isEqual(this.lastSavedUserSettings, userSettings)) {
        this.debouncedTriggerChange(userSettings);
      }

      return getters[property];
    };
  }

  @autobind
  private triggerChange(settings: IBaseTableUserSettings): void {
    this.lastSavedUserSettings = settings;
    this.props.onSettingsChange(settings);
  }

}
