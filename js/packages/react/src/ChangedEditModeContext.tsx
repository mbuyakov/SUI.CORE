import * as React from 'react';
import {useState} from "react";
import {DisableEditContext} from './DisableEditContext';

const EditModeContext = React.createContext<(editMode: boolean) => void>(null);

interface IEditModeContainerProps {
  children?: React.ReactNode;
  defaultEditMode?: boolean;
}

function EditModeContainer(props: IEditModeContainerProps): JSX.Element {
  const [editMode, setEditMode] = useState(!!props.defaultEditMode || false);

  return (
    // receive outer disable value to push to the inner disable context
    <DisableEditContext.Consumer>
      {(disable): JSX.Element => (
        <EditModeContext.Provider value={setEditMode}>
          <DisableEditContext.Provider value={disable || editMode}>
            {props.children}
          </DisableEditContext.Provider>
        </EditModeContext.Provider>
      )}
    </DisableEditContext.Consumer>
  );
}

export class ChangedEditModeContext {
  public static Container = EditModeContainer;
  public static Consumer = EditModeContext.Consumer;
}
