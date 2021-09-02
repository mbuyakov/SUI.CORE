import type {Event, EventHint} from "@sentry/browser";

export async function initSentry(
  dsn: string,
  release: string,
  environment: string,
  beforeSend: (event: Event, hint: EventHint) => Event | null = undefined
): Promise<void> {
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
    integrations,
    beforeSend
  });
}
