import { LinkPlugin, RawPlugin, TableRenderParamsPlugin, UnknownPlugin } from './plugins';

export class TableRenderSettingsPluginManager {
  // tslint:disable-next-line:no-any
  public static plugins: Map<string, TableRenderParamsPlugin<any>> = new Map();

  // tslint:disable-next-line:no-any
  public static register(plugin: TableRenderParamsPlugin<any>): void {
    if(TableRenderSettingsPluginManager.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id = ${plugin.id} already registered`);
    }
    TableRenderSettingsPluginManager.plugins.set(plugin.id, plugin);
  }
}

TableRenderSettingsPluginManager.register(new RawPlugin());
TableRenderSettingsPluginManager.register(new LinkPlugin());
TableRenderSettingsPluginManager.register(new UnknownPlugin());
