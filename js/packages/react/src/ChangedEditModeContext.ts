import * as React from 'react';

export const ChangedEditModeContext = React.createContext<{
  disabledEditMode: boolean,
  setDisabledEditMode(disabledEditMode: boolean): void,
}>({ disabledEditMode: false, setDisabledEditMode: null});
