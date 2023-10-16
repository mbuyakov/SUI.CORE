import {ISentry} from "./types";
import {SingletonAndOnlyIoc} from "@sui/deps-ioc";

abstract class SentryService implements ISentry {
  abstract sentryReact: typeof import("@sentry/react");
  abstract sentryIntegrations: typeof import("@sentry/integrations");
  abstract sentryTracing: typeof import("@sentry/tracing");
}

export class SentryServiceImpl extends SentryService {
  sentryReact: typeof import("@sentry/react");
  sentryIntegrations: typeof import("@sentry/integrations");
  sentryTracing: typeof import("@sentry/tracing");

  constructor(sentryReact: typeof import("@sentry/react"), sentryIntegrations: typeof import("@sentry/integrations"), sentryTracing: typeof import("@sentry/tracing")) {
    super();
    this.sentryReact = sentryReact;
    this.sentryIntegrations = sentryIntegrations;
    this.sentryTracing = sentryTracing;
  }
}

const _SentryService = SingletonAndOnlyIoc(SentryService);
export {_SentryService as SentryService};
