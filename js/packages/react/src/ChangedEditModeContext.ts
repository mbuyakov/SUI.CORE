import * as React from 'react';

export const ChangedEditModeContext = React.createContext<{
  editMode: boolean,
  change(editMode: boolean): void,
}>({ editMode: false, change: null});
