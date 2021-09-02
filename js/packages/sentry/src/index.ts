// eslint-disable-next-line no-restricted-imports
import type {BrowserOptions} from "@sentry/browser";

export interface ISentry {
  sentryBrowser: typeof import('@sentry/browser'),
  sentryIntegrations: typeof import('@sentry/integrations'),
  sentryTracing: typeof import('@sentry/tracing'),
}

export async function initSentry(getOptions: (libs: ISentry) => BrowserOptions): Promise<void> {
  const [
    sentryBrowser,
    sentryIntegrations,
    sentryTracing
  ] = await Promise.all([
    import('@sentry/browser'),
    import('@sentry/integrations'),
    import('@sentry/tracing'),
  ]);

  const options = getOptions({
    sentryBrowser,
    sentryIntegrations,
    sentryTracing
  });

  options.defaultIntegrations = [
    new sentryIntegrations.CaptureConsole({
      levels: ['error', 'warn']
    }),
    new sentryTracing.Integrations.BrowserTracing()
  ];

  // Override default 20
  options.maxBreadcrumbs = options.maxBreadcrumbs || 100;
  // To enable tracing
  options.tracesSampleRate = options.tracesSampleRate || 1.0;
  // Why not?
  options.autoSessionTracking = typeof options.autoSessionTracking === 'boolean' ? options.autoSessionTracking : true;

  sentryBrowser.init(options);
}
