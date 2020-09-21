import {InMemoryCache} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {Container} from 'typescript-ioc';
import {authLink, IInitSUISettings, ISUISettings, ColorHeatMap, TableInfoManager, ColumnInfoManager, NameManager} from '@sui/core';

import {parseRoutes, runCheckVersionMismatch} from '@/utils';

declare let window: Window & {
  SUI: ISUISettings | undefined;
  SUI_CORE_PTC_CACHE: ColorHeatMap;
};


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
