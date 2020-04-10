import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';

import { ColumnInfoManager, NameManager, TableInfoManager } from '../cache';
import { Color, findColorBetween, IPercentToColorSettings } from '../color';
import { getUser, IRawRoute, parseRoutes, RouteType } from '../utils';

declare let window: Window & {
  SUI: ISUISettings | undefined;
  SUI_CORE_PTC_CACHE: Map<number, Color> | undefined;
};

export interface IInitSUISettings {
  backendUrl: string;
  basicAuthToken?: string;
  graphqlUri: string;
  percentToColorSettings: IPercentToColorSettings;
  routes: IRawRoute[];
  defaultGetLinkForTable?(tableName: string, type: RouteType, id?: string | number): string | null;
  metaschemaRefreshPromise(): Promise<void>;

  // tslint:disable-next-line:no-any
  routerPushFn(link: any): void;
  // tslint:disable-next-line:no-any
  routerReplaceFn(link: any): void;
}


export type ISUISettings = IInitSUISettings & {
  apolloClient: ApolloClient<{}>;
}



export function initSUI(settings: IInitSUISettings): void {
  window.SUI = {
    ...settings,
    apolloClient: new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: settings.graphqlUri,
        // tslint:disable-next-line
        headers: {
          ...(settings.basicAuthToken ? {authorization: settings.basicAuthToken} : undefined),
          "user-id": getUser().id
        }
      }),
    })
  };

  parseRoutes(settings.routes);
  const timeLabel = 'MetaInfoManagers load';
  console.time(timeLabel);
  // tslint:disable-next-line:no-floating-promises
  Promise.all([TableInfoManager.loadAll(), ColumnInfoManager.loadAll(), NameManager.loadAll()]).then(() => console.timeEnd(timeLabel));

  window.SUI_CORE_PTC_CACHE = new Map<number, Color>();
  for (let i = 0; i < 100; i++) {
    const left = i >= 50 ? settings.percentToColorSettings.center : settings.percentToColorSettings.left;
    const right = i >= 50 ? settings.percentToColorSettings.right : settings.percentToColorSettings.center;
    window.SUI_CORE_PTC_CACHE.set(i, findColorBetween(left, right, Math.pow(Math.cos(Math.PI / 100 * (50 - (i >= 50 ? (i - 50) * 2 : i * 2) / 2)), 2)  * 100));
  }
}

export function getSUISettings(): ISUISettings {
  const settings = window.SUI;
  if(!settings) {
    throw new Error("SUI not initialized");
  }

  return settings;
}
