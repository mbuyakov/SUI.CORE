/* eslint-disable no-restricted-imports */
import type {BrowserOptions} from "@sentry/react";
import type {RouteConfig, RouterHistory} from "@sentry/react/dist/reactrouter";

export interface ISentry {
  sentryReact: typeof import('@sentry/react'),
  sentryIntegrations: typeof import('@sentry/integrations'),
  sentryTracing: typeof import('@sentry/tracing'),
}

// Copy from @sentry/react. This types doesn't exported
declare type Match = {
  path: string;
  url: string;
  params: Record<string, any>;
  isExact: boolean;
};
declare type MatchPath = (pathname: string, props: string | string[] | any, parent?: Match | null) => Match | null;

let sentryInitPromise: Promise<void>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let sentryInstance: ISentry = null;

export async function getSentry(): Promise<ISentry> {
  if (sentryInstance) {
    return sentryInstance;
  }
  if (sentryInitPromise) {
    await sentryInitPromise;
    return sentryInstance;
  }
  sentryInitPromise = Promise.all([
    import('@sentry/react'),
    import('@sentry/integrations'),
    import('@sentry/tracing'),
  ]).then(([
             sentryReact,
             sentryIntegrations,
             sentryTracing
           ]) => {
    sentryInstance = {
      sentryReact,
      sentryIntegrations,
      sentryTracing
    }
  });
  await sentryInitPromise;
  return sentryInstance;
}

export async function initSentry(getOptions: (libs: ISentry) => BrowserOptions & {
  history: RouterHistory,
  routes?: RouteConfig[],
  matchPath?: MatchPath
}): Promise<void> {

  const sentry = await getSentry();
  const options = getOptions(sentry);

  if (typeof options.integrations === "function") {
    throw new Error("Function in integrations not supported. Please, use array")
  }

  options.integrations = options.integrations || [];

  options.integrations.push(
    new sentry.sentryIntegrations.CaptureConsole({
      levels: ['error', 'warn']
    })
  );
  options.integrations.push(
    new sentry.sentryTracing.Integrations.BrowserTracing({
      tracingOrigins: [/.+/],
      routingInstrumentation: sentry.sentryReact.reactRouterV5Instrumentation(options.history, options.routes, options.matchPath)
    })
  );

  // Override default 20
  options.maxBreadcrumbs = options.maxBreadcrumbs || 100;
  // To enable tracing
  options.tracesSampleRate = options.tracesSampleRate || 1.0;
  // Why not?
  options.autoSessionTracking = typeof options.autoSessionTracking === 'boolean' ? options.autoSessionTracking : true;

  sentry.sentryReact.init(options);
}
