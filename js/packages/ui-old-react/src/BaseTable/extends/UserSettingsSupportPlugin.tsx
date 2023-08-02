import {Getter, Getters, Plugin, TableColumn, TableColumnWidthInfo} from "@sui/deps-dx-react-grid";
import React from "react";

const fullOrderComputed = (getters: Getters): string[] => (getters.tableColumns as TableColumn[]).filter(it => it.column).map(it => it.column.name);
const fullColumnWidthsComputed = (getters: Getters): TableColumnWidthInfo[] => (getters.tableColumns as TableColumn[]).filter(it => it.column).map(it => ({columnName: it.column.name, width: it.width}));

// Плагин, помогающий UserSettingsPlugin, не потерять информацию о скрытых колонках
// (т.к. он применяется до TableColumnVisibility)
export class UserSettingsSupportPlugin extends React.Component {

  public render(): React.JSX.Element {
    return (
      <Plugin name="UserSettingsSupport">
        <Getter
          name="fullOrder"
          computed={fullOrderComputed}
        />
        <Getter
          name="fullColumnWidths"
          computed={fullColumnWidthsComputed}
        />
      </Plugin>
    );
  }

}
