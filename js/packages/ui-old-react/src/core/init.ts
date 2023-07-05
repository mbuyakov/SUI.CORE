import {InMemoryCache} from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {Container} from "@sui/deps-ioc";
import {authLink, ColumnInfoManager, IInitSUISettings, ISUISettings, NameManager, TableInfoManager} from "@sui/ui-old-core";

import {parseRoutes, runCheckVersionMismatch} from "@/utils";

declare let window: Window & {
  SUI: ISUISettings | undefined;
};

// noinspection JSUnusedGlobalSymbols
export function initSUI(settings: IInitSUISettings): void {
  window.SUI = {
    ...settings,
    apolloClient: new ApolloClient({
      cache: new InMemoryCache(),
      link: authLink.concat(new HttpLink({
        uri: settings.graphqlUri
      })),
    }),
  };

  Container.bindName("sui").to(settings);

  parseRoutes(settings.routes);
  if (!settings.offlineMode) {
    const timeLabel = "MetaInfoManagers load";
    console.time(timeLabel);
    Promise.all([TableInfoManager.loadAll(), ColumnInfoManager.loadAll(), NameManager.loadAll()]).then(() => console.timeEnd(timeLabel));
  }

  runCheckVersionMismatch();
}
