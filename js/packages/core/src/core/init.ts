/* eslint-disable @typescript-eslint/no-explicit-any */
import ApolloClient from 'apollo-client';
import {setContext} from 'apollo-link-context';
import {Container} from 'typescript-ioc';

import {ColorHeatMap, IColorHeatMapSettings} from '@/color';
import {ICoreUser} from '@/user';
import {UserService} from "@/ioc";
import {IRawRoute, RouteType} from '@/tmp';

declare let window: Window & {
  SUI: ISUISettings | undefined;
  SUI_CORE_PTC_CACHE: ColorHeatMap;
};

export type Permission = (user: ICoreUser) => boolean;

export interface IInitSUISettings {
  projectKey: string;
  backendUrl: string;
  checkVersionMismatchUrl: string;
  enableDoubleVerticalScrollForAllTables?: boolean;
  graphqlUri: string;
  ignoreColumnRoleRestriction?: boolean;
  restUri: string;
  rusName: string;
  offlineMode?: boolean;
  percentToColorSettings: IColorHeatMapSettings;
  permissions?: { exportAll?: Permission };
  routes: IRawRoute[];
  chart?: { queue: boolean, onlyShowOnViewport: boolean };

  defaultGetLinkForTable?(tableName: string, type: RouteType, id?: string | number): string | null;

  metaschemaRefreshPromise(): Promise<void>;

  routerPushFn(link: any): void;

  routerReplaceFn(link: any): void;
}


export type ISUISettings = IInitSUISettings & {
  // eslint-disable-next-line @typescript-eslint/ban-types
  apolloClient: ApolloClient<{}>;
}

export const authLink = setContext((_, {headers}) => {
  const userService = Container.get(UserService);
  const user = userService.isLoggedIn() && userService.getUser();

  return {
    headers: {
      ...headers,
      ...(user ? {'user-id': user.id} : {}),
    },
  };
});


export function getSUISettings(): ISUISettings {
  const settings = window.SUI;
  if (!settings) {
    throw new Error('SUI not initialized');
  }

  return settings;
}
