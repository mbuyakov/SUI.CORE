import * as React from 'react';

import { DEFAULT_ITEM_RENDERER} from './BaseCardItemLayout';

export interface IBaseCardContext {
  forceRenderTabs: boolean;
  // tslint:disable-next-line:no-any
  itemRenderer?(sourceItem: any, item: any, colspan: number): React.ReactNode
}

// tslint:disable-next-line:no-any variable-name
export const BaseCardContext = React.createContext<IBaseCardContext>({
  forceRenderTabs: false,
  itemRenderer: DEFAULT_ITEM_RENDERER
});
