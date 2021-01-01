// https://github.com/DevExpress/devextreme-reactive/blob/f2007142015d27482e45e96b60f2ec6536d3a9b9/packages/dx-grid-core/src/plugins/integrated-selection/computeds.ts#L8
import {allSelected, someSelected, unwrapSelectedRows,} from '@devexpress/dx-grid-core';
import {Action, Actions, Getter, Getters, Plugin} from '@devexpress/dx-react-core';
import {IntegratedSelectionProps} from "@devexpress/dx-react-grid";
import * as React from 'react';

// НОВОЕ
interface IExtendedIntegratedSelectionProps extends IntegratedSelectionProps {
  selectionFilter?(row: any): boolean;
}

// ИЗМЕНЕНО
const rowsWithAvailableToSelectComputed = ({rows, getRowId, isGroupRow}: Getters, selectionFilter?: (row: any) => boolean) => {
  let dataRows = rows;

  if (isGroupRow) {
    dataRows = dataRows.filter(row => !isGroupRow(row));
  }

  if (selectionFilter) {
    dataRows = dataRows.filter(row => !selectionFilter(row));
  }

  // Костыль для отображения селекта выбора
  dataRows.forEach(row => {
    row.__SUI_available_to_select = true;
  });

  return {rows, availableToSelect: dataRows.map(row => getRowId(row))};
};

const allSelectedComputed = ({rows, selection}: Getters) => allSelected(rows, selection);
const someSelectedComputed = ({rows, selection}: Getters) => someSelected(rows, selection);
const selectAllAvailableComputed = ({rows: {availableToSelect}}: Getters) => !!availableToSelect.length;

const toggleSelectAll = (state, {rows: {availableToSelect}}: Getters, {toggleSelection}: Actions) => toggleSelection({state, rowIds: availableToSelect});
const unwrapRowsComputed = ({rows}: Getters) => unwrapSelectedRows(rows);

const pluginDependencies = [
  {name: 'SelectionState'},
];

// eslint-disable-next-line react/prefer-stateless-function
class ExtendedIntegratedSelectionBase extends React.PureComponent<IExtendedIntegratedSelectionProps> {
  render() {
    return (
      <Plugin
        name="IntegratedSelection"
        dependencies={pluginDependencies}
      >
        <Getter name="rows" computed={getters => rowsWithAvailableToSelectComputed(getters, this.props.selectionFilter)}/>
        <Getter name="allSelected" computed={allSelectedComputed}/>
        <Getter name="someSelected" computed={someSelectedComputed}/>
        <Getter name="selectAllAvailable" computed={selectAllAvailableComputed}/>
        <Action name="toggleSelectAll" action={toggleSelectAll}/>
        <Getter name="rows" computed={unwrapRowsComputed}/>
      </Plugin>
    );
  }
}

/** A plugin that performs built-in selection. */
export const ExtendedIntegratedSelection: React.ComponentType<IExtendedIntegratedSelectionProps> = ExtendedIntegratedSelectionBase;
