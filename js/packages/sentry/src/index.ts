export async function initSentry(dsn: string, release: string, environment: string): Promise<void> {
  const [
    sentryBrowser,
    sentryIntegrations
  ] = await Promise.all([
    import('@sentry/browser'),
    import('@sentry/integrations')
  ]);

  const integrations = [];

  if (environment != 'local') {
    integrations.push(new sentryIntegrations.CaptureConsole({
      levels: ['error', 'warn']
    }));
  }

  sentryBrowser.init({
    dsn,
    release,
    environment,
    integrations
  });
}
