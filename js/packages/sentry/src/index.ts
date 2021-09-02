import type {BrowserOptions} from "@sentry/browser";

export async function initSentry(options: BrowserOptions): Promise<void> {
  const [
    sentryBrowser,
    sentryIntegrations
  ] = await Promise.all([
    import('@sentry/browser'),
    import('@sentry/integrations')
  ]);

  options.defaultIntegrations = [
    new sentryIntegrations.CaptureConsole({
      levels: ['error', 'warn']
    })
  ];

  // Override default 20
  options.maxBreadcrumbs = options.maxBreadcrumbs || 100;

  sentryBrowser.init(options);
}
