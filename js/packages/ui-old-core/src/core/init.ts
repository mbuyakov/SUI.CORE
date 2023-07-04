/* eslint-disable @typescript-eslint/no-explicit-any */
import ApolloClient from "apollo-client";
import {setContext} from "apollo-link-context";
import {Container} from "@sui/deps-ioc";

import {IRawRoute, RouteType} from "@/tmp";
import {ICoreUser, UserService} from "@sui/lib-auth";

declare let window: Window & {
  SUI: ISUISettings | undefined;
};

export type Permission = (user: ICoreUser) => boolean;

interface MessageDescriptor {
  id: string;
  description?: string;
  defaultMessage?: string;
}
declare type MessageValue = string | number | boolean | Date | null | undefined;

export interface IInitSUISettings {
  projectKey: string;
  backendUrl: string;
  checkVersionMismatchUrl: string;
  enableDoubleVerticalScrollForAllTables?: boolean;
  graphqlUri: string;
  ignoreColumnRoleRestriction?: boolean;
  restUri: string;
  rusName: string;
  buildTime: string;
  offlineMode?: boolean;
  hideTableSettings?: boolean;
  permissions?: { exportAll?: Permission };
  routes: IRawRoute[];
  chart?: { queue: boolean, onlyShowOnViewport: boolean };
  ACCESS_RIGHTS: {
    [role: string]: any[];
  };
  layout: {
    getIcon(icon: string): JSX.Element;
    formatMessage(
      messageDescriptor: MessageDescriptor,
      values?: { [key: string]: MessageValue },
    ): string
  }
  defaultGetLinkForTable?(tableName: string, type: RouteType, id?: string | number): string | null;

  metaschemaRefreshUrl: string;
  metaschemaExportUrl?: string;
  dropUserSettingsUrl?: string;

  routerPushFn(link: any): void;

  routerReplaceFn(link: any): void;
}


export type ISUISettings = IInitSUISettings & {
  // eslint-disable-next-line @typescript-eslint/ban-types
  apolloClient: ApolloClient<{}>;
};

export const authLink = setContext((_, {headers}) => {
  const userService = Container.get(UserService);
  const user = userService.isLoggedIn() && userService.getUser();

  return {
    headers: {
      ...headers,
      ...(user ? {"user-id": user.id} : {}),
    },
  };
});


export function getSUISettings(): ISUISettings {
  const settings = window.SUI;
  if (!settings) {
    throw new Error("SUI not initialized");
  }

  return settings;
}
