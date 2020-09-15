import * as React from 'react';

import { DEFAULT_ITEM_RENDERER} from './BaseCardItemLayout';

export interface IBaseCardContext {
  forceRenderTabs: boolean;
  itemRenderer?(sourceItem: any, item: any, colspan: number): React.ReactNode
}

export const BaseCardContext = React.createContext<IBaseCardContext>({
  forceRenderTabs: false,
  itemRenderer: DEFAULT_ITEM_RENDERER
});
