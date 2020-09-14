import {InMemoryCache} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import {setContext} from 'apollo-link-context';
import {HttpLink} from 'apollo-link-http';
import {Container} from 'typescript-ioc';

import {ColumnInfoManager, NameManager, TableInfoManager} from '../cache';
import {ColorHeatMap, IColorHeatMapSettings} from '../color';
import {ICoreUser} from "../user";
import {IRawRoute, parseRoutes, RouteType, runCheckVersionMismatch} from '../utils';
import {UserService} from '../ioc/service';

declare let window: Window & {
  SUI: ISUISettings | undefined;
  SUI_CORE_PTC_CACHE: ColorHeatMap;
};

export type Permission = (user: ICoreUser) => boolean;

export interface IInitSUISettings {
  projectKey: string;
  backendUrl: string;
  basicAuthToken?: string;
  checkVersionMismatchUrl: string;
  graphqlUri: string;
  restUri: string;
  rusName: string;
  percentToColorSettings: IColorHeatMapSettings;
  permissions?: {
    exportAll?: Permission
  },
  routes: IRawRoute[];

  defaultGetLinkForTable?(tableName: string, type: RouteType, id?: string | number): string | null;
  metaschemaRefreshPromise(): Promise<void>;
  routerPushFn(link: any): void;
  routerReplaceFn(link: any): void;
}


export type ISUISettings = IInitSUISettings & {
  apolloClient: ApolloClient<{}>;
}

const authLink = setContext((_, {headers}) => {
  const userService = Container.get(UserService);
  const user = userService.isLoggedIn() && userService.getUser();

  return {
    headers: {
      ...headers,
      ...(user ? {'user-id': user.id} : {}),
    },
  };
});

// noinspection JSUnusedGlobalSymbols
export function initSUI(settings: IInitSUISettings): void {
  window.SUI = {
    ...settings,
    apolloClient: new ApolloClient({
      cache: new InMemoryCache(),
      link: authLink.concat(new HttpLink({
        uri: settings.graphqlUri,
        headers: {
          ...(settings.basicAuthToken ? {authorization: settings.basicAuthToken} : undefined),
        },
      })),
    }),
  };


  Container.bindName('sui').to(settings);

  parseRoutes(settings.routes);
  const timeLabel = 'MetaInfoManagers load';
  console.time(timeLabel);
  Promise.all([TableInfoManager.loadAll(), ColumnInfoManager.loadAll(), NameManager.loadAll()]).then(() => console.timeEnd(timeLabel));

  window.SUI_CORE_PTC_CACHE = new ColorHeatMap(settings.percentToColorSettings);

  runCheckVersionMismatch();
}

export function getSUISettings(): ISUISettings {
  const settings = window.SUI;
  if (!settings) {
    throw new Error('SUI not initialized');
  }

  return settings;
}
