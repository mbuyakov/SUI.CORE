import * as React from 'react';

export interface IBaseCardContext {
  forceRenderTabs: boolean
}

// tslint:disable-next-line:no-any variable-name
export const BaseCardContext = React.createContext<IBaseCardContext>(null as any);
