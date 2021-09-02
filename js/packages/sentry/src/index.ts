// eslint-disable no-restricted-imports
import type {BrowserOptions} from "@sentry/react";
import type {RouterHistory} from "@sentry/react/dist/reactrouter";

export interface ISentry {
  sentryReact: typeof import('@sentry/react'),
  sentryIntegrations: typeof import('@sentry/integrations'),
  sentryTracing: typeof import('@sentry/tracing'),
}

let sentryInitPromise: Promise<void>;
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
  history: RouterHistory
}): Promise<void> {

  const sentry = await getSentry();
  const options = getOptions(sentry);

  options.defaultIntegrations = [
    new sentry.sentryIntegrations.CaptureConsole({
      levels: ['error', 'warn']
    }),
    new sentry.sentryTracing.Integrations.BrowserTracing({
      routingInstrumentation: sentry.sentryReact.reactRouterV5Instrumentation(options.history)
    })
  ];

  // Override default 20
  options.maxBreadcrumbs = options.maxBreadcrumbs || 100;
  // To enable tracing
  options.tracesSampleRate = options.tracesSampleRate || 1.0;
  // Why not?
  options.autoSessionTracking = typeof options.autoSessionTracking === 'boolean' ? options.autoSessionTracking : true;

  sentry.sentryReact.init(options);
}
