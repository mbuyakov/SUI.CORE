import * as React from 'react';
import {useState} from 'react';
import {DisableEditContext} from './DisableEditContext';

export interface IEditModeContext {
  outerDisable: boolean,

  setEditMode(editMode: boolean): void,
}

const EditModeContext = React.createContext<IEditModeContext>({
  outerDisable: false,
  setEditMode: null,
});

interface IEditModeContainerProps {
  children?: React.ReactNode;
  defaultEditMode?: boolean;
}

function EditModeContainer(props: IEditModeContainerProps): JSX.Element {
  const [editMode, setEditMode] = useState(!!props.defaultEditMode || false);
  let providerValue: IEditModeContext = {outerDisable: false, setEditMode};

  return (
    // receive outer disable value to push to the inner disable context
    <DisableEditContext.Consumer>
      {(disable): JSX.Element => {
        if (providerValue.outerDisable !== disable) {
          providerValue = {outerDisable: false, setEditMode};
        }

        return (
          <EditModeContext.Provider value={providerValue}>
            <DisableEditContext.Provider value={disable || editMode}>
              {props.children}
            </DisableEditContext.Provider>
          </EditModeContext.Provider>
        );
      }}
    </DisableEditContext.Consumer>
  );
}

export class ChangedEditModeContext {
  public static Container = EditModeContainer;
  public static Consumer = EditModeContext.Consumer;
}
