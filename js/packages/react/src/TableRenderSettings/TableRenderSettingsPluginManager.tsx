/* eslint-disable @typescript-eslint/no-explicit-any */
import {TableRenderParamsPlugin} from './plugins';

export class TableRenderSettingsPluginManager {
  public static plugins: Map<string, TableRenderParamsPlugin<any>> = new Map();

  public static register(plugin: TableRenderParamsPlugin<any>): void {
    if (TableRenderSettingsPluginManager.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id = ${plugin.id} already registered`);
    }
    TableRenderSettingsPluginManager.plugins.set(plugin.id, plugin);
  }
}
