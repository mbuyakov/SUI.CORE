/* eslint-disable @typescript-eslint/no-explicit-any */
import {MetaCardPlugin} from "./MetaCardPlugin";
// import {ChartPlugin} from "./plugins/chart";

export class MetaCardConfigurator {
  public static plugins: Map<string, MetaCardPlugin<any>> = new Map();

  public static initPlugin(plugin: MetaCardPlugin<any>): void {
    MetaCardConfigurator.plugins.set(plugin.id, plugin);
  }

  // public static initStandardPlugins(): void {
  //   MetaCardConfigurator.initPlugin(new ChartPlugin());
  // }
}

// MetaCardConfigurator.initStandardPlugins();

