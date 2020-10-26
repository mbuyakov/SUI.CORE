export async function initSentry(dsn: string, release: string): Promise<void> {
  const [
    sentryBrowser,
    sentryIntegrations
    ] = await Promise.all([
    import('@sentry/browser'),
    import('@sentry/integrations')
  ]);

  sentryBrowser.init({
    dsn,
    release,
    integrations: [
      new sentryIntegrations.CaptureConsole({
        levels: ['error', 'warning']
      })
    ],
  });
}
