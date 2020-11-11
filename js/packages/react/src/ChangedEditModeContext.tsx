import * as React from 'react';
import {useState} from "react";

const EditModeContext = React.createContext<{
  editMode: boolean,
  setEditMode(editMode: boolean): void,
}>({editMode: false, setEditMode: null});

interface IEditModeContainerProps {
  children?: React.ReactNode;
  defaultEditMode?: boolean;
}

function EditModeContainer(props: IEditModeContainerProps): JSX.Element {
  const [editMode, setEditMode] = useState(!!props.defaultEditMode || false);
  return (
    <EditModeContext.Provider value={{editMode, setEditMode}}>
      {props.children}
    </EditModeContext.Provider>
  );
}

export class ChangedEditModeContext {
  public static Container = EditModeContainer;
  public static Consumer = EditModeContext.Consumer;
}
