/* tslint:disable:no-magic-numbers */
import {ComputedFn, Getter, Getters, Plugin} from '@devexpress/dx-react-core';
import {TableColumn, TableColumnWidthInfo} from '@devexpress/dx-react-grid';
import autobind from "autobind-decorator";
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
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
  const tableColumns: TableColumn[] = getters.tableColumns;

  return {
    columnWidths: tableColumns.map(it => ({columnName: it.column.name, width: it.width})),
    hiddenColumnNames: getters.hiddenColumnNames || [],
    order: tableColumns.map(it => it.column.name),
  }
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
    return (getters): any => {
      const userSettings = generateUserSettings(getters);

      if (!this.lastSavedUserSettings) {
        this.lastSavedUserSettings = userSettings;
      } else if (!isEqual(this.lastSavedUserSettings, userSettings)) {
        this.debouncedTriggerChange(userSettings);
      }

      return getters[property];
    }
  }

  @autobind
  private triggerChange(settings: IBaseTableUserSettings): void {
    this.lastSavedUserSettings = settings;
    this.props.onSettingsChange(settings);
  }

}
