import {SuiModuleWithSettings} from "@sui/lib-module-manager";


import {SentrySettings} from "./types";
import {Container} from "@sui/deps-ioc";
import {SentryService, SentryServiceImpl} from "./SentryService";

export class LibSentryModule extends SuiModuleWithSettings<SentrySettings> {

  protected getName(): string {
    return "LibSentryModule";
  }

  override async init(): Promise<void> {
    const imports = await Promise.all([
      import("@sentry/react"),
      import("@sentry/integrations"),
      import("@sentry/tracing"),
    ]);

    const sentryService = new SentryServiceImpl(imports[0], imports[1], imports[2]);
    Container.bind(SentryService).factory(() => sentryService);

    const options = this.settings(sentryService);

    if (typeof options.integrations === "function") {
      throw new Error("Function in integrations not supported. Please, use array");
    }

    options.integrations = options.integrations || [];

    options.integrations.push(
      new sentryService.sentryIntegrations.CaptureConsole({
        levels: ["error", "warn"]
      })
    );
    options.integrations.push(
      new sentryService.sentryTracing.Integrations.BrowserTracing({
        tracingOrigins: [/.+/],
        routingInstrumentation: sentryService.sentryReact.reactRouterV5Instrumentation(options.history, options.routes, options.matchPath)
      })
    );

    // Override default 20
    options.maxBreadcrumbs = options.maxBreadcrumbs ?? 100;
    // To enable tracing
    options.tracesSampleRate = options.tracesSampleRate ?? 1.0;
    // Why not?
    options.autoSessionTracking = options.autoSessionTracking ?? true;

    sentryService.sentryReact.init(options);
  }
}
