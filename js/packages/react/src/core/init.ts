import {InMemoryCache} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {Container} from 'typescript-ioc';
import {authLink, ColorHeatMap, ColumnInfoManager, IInitSUISettings, ISUISettings, NameManager, TableInfoManager} from '@sui/core';

import {parseRoutes, runCheckVersionMismatch} from '@/utils';
import {ThemesConfig} from "@/themes";

declare let window: Window & {
  SUI: ISUISettings | undefined;
  SUI_CORE_PTC_CACHE: ColorHeatMap;
};

type _IInitSUISettings = IInitSUISettings & {
  themes: ThemesConfig,
  noDark?: boolean
}

// noinspection JSUnusedGlobalSymbols
export function initSUI(settings: _IInitSUISettings): void {
  window.SUI = {
    ...settings,
    apolloClient: new ApolloClient({
      cache: new InMemoryCache(),
      link: authLink.concat(new HttpLink({
        uri: settings.graphqlUri
      })),
    }),
  };


  Container.bindName('sui').to(settings);

  parseRoutes(settings.routes);
  if (!settings.offlineMode) {
    const timeLabel = 'MetaInfoManagers load';
    console.time(timeLabel);
    Promise.all([TableInfoManager.loadAll(), ColumnInfoManager.loadAll(), NameManager.loadAll()]).then(() => console.timeEnd(timeLabel));
  }

  window.SUI_CORE_PTC_CACHE = new ColorHeatMap(settings.percentToColorSettings);

  runCheckVersionMismatch(settings.buildTime);
}
