/* tslint:disable:no-magic-numbers */
import {ComputedFn, Getter, Plugin} from '@devexpress/dx-react-core';
import autobind from "autobind-decorator";
import React from "react";

export interface IClearSelectionAfterRowsHaveChangedPluginProps {
  selection?: any[];

  clearSelection(): void;
}

export class ClearSelectionAfterRowsHaveChangedPlugin extends React.Component<IClearSelectionAfterRowsHaveChangedPluginProps> {

  private lastSavedIds: string[];

  public render(): JSX.Element {
    return (
      <Plugin name="ClearSelectionAfterRowsHaveChanged">
        <Getter name="rows" computed={this.computedForWatcher("rows")}/>
      </Plugin>
    );
  }

  @autobind
  private computedForWatcher(property: string): ComputedFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getters): any => {
      const ids = getters.rows.map(it => it?.id).filter(Boolean);

      if (this.props.selection?.length
        && (this.lastSavedIds?.length != ids?.length || !this.lastSavedIds.every(id => ids.includes(id)))
      ) {
        this.props.clearSelection();
      }

      this.lastSavedIds = ids;

      return getters[property];
    }
  }

}
