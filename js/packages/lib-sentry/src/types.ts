import type {BrowserOptions} from "@sentry/react";
import type {RouteConfig, RouterHistory} from "@sentry/react/dist/reactrouter";

export interface ISentry {
  sentryReact: typeof import("@sentry/react"),
  sentryIntegrations: typeof import("@sentry/integrations"),
  sentryTracing: typeof import("@sentry/tracing"),
}

// Copy from @sentry/react. This types doesn't exported
declare type Match = {
  path: string;
  url: string;
  params: Record<string, any>;
  isExact: boolean;
};
declare type MatchPath = (pathname: string, props: string | string[] | any, parent?: Match | null) => Match | null;

export type SentrySettings = (libs: ISentry) => BrowserOptions & {
  history: RouterHistory,
  routes?: RouteConfig[],
  matchPath?: MatchPath
};
