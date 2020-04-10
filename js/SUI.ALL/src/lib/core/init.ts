import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';

import { getUser } from '../utils';

declare let window: Window & {
  /**
   * Variable for global client instance
   */
  SUI: ISUISettings | undefined;
};

export interface IInitSUISettings {
  backendUrl: string;
  basicAuthToken?: string;
  graphqlUri: string;
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
}

export function getSUISettings(): ISUISettings {
  const settings = window.SUI;
  if(!settings) {
    throw new Error("SUI not initialized");
  }

  return settings;
}
