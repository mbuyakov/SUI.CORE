import {SuiModule} from './SuiModule';
import {ModuleDepsInitEvent, ModuleDepsInitializedEvent, ModuleDiscoveredEvent, ModuleDuplicateEvent, ModuleFailedEvent, ModuleInitEvent, ModuleInitializedEvent,} from './event';
import {MainModule} from './MainModule';
import {EventManager} from "@sui/lib-event-manager";
import {Container} from "@sui/deps-ioc";
import * as React from "react";

export class ModuleManager extends EventManager<
  | ModuleDiscoveredEvent
  | ModuleInitEvent
  | ModuleDepsInitEvent
  | ModuleDepsInitializedEvent
  | ModuleInitializedEvent
  | ModuleDuplicateEvent
  | ModuleFailedEvent
> {
  // Order is important for modifyRoot
  private readonly initializedModules: string[] = [];
  private readonly modulesInstances: Map<string, SuiModule> = new Map();

  constructor(projectKey: string, restUrl: string) {
    super();
    Container.bindName("sui.projectKey").to(projectKey);
    Container.bindName("sui.restUrl").to(restUrl);
    this.modulesInstances.set('MainModule', new MainModule());

    this.addHandler(ModuleDiscoveredEvent, (it) => console.log(`Module ${it.moduleName} discovered`));
    this.addHandler(ModuleInitEvent, (it) => console.log(`Module ${it.moduleName} init`));
    this.addHandler(ModuleDepsInitEvent, (it) => console.log(`Module ${it.moduleName} deps init`));
    this.addHandler(ModuleDepsInitializedEvent, (it) => console.log(`Module ${it.moduleName} deps initialized in ${it.duration}ms`));
    this.addHandler(ModuleInitializedEvent, (it) => console.log(`Module ${it.moduleName} initialized in ${it.duration}ms`));

    this.addHandler(ModuleDuplicateEvent, (it) => console.error(`Module ${it.moduleName} has duplicate`));
    this.addHandler(ModuleFailedEvent, (it) => console.error(`Module ${it.moduleName} failed`, it.error));
  }

  public addModule(module: SuiModule): void {
    const name = module.name;
    if (this.modulesInstances.has(name)) {
      // noinspection JSIgnoredPromiseFromCall
      this.dispatch(ModuleDuplicateEvent, new ModuleDuplicateEvent(name));
      throw new Error(`Module ${name} has duplicate`);
    }

    this.modulesInstances.set(name, module);
    (this.modulesInstances.get('MainModule') as MainModule).deps.push(name);
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(ModuleDiscoveredEvent, new ModuleDiscoveredEvent(name));
  }

  public async init(): Promise<void> {
    return this.initModule('MainModule');
  }

  public modifyRoot(root: React.ReactNode): React.ReactNode {
    return this.initializedModules.reduce((prev, cur) => this.modulesInstances.get(cur)!.modifyRoot(prev), root);
  }

  private async initModule(name: string): Promise<void> {
    if (this.initializedModules.includes(name)) {
      return;
    }

    await this.dispatch(ModuleInitEvent, new ModuleInitEvent(name));
    const loadStartTime = new Date().getTime();
    const module = this.modulesInstances.get(name);

    if (module == null) {
      const error = new Error(`Required module ${name} not founded`);
      // noinspection ES6MissingAwait
      this.dispatch(ModuleFailedEvent, new ModuleFailedEvent(name, error));
      throw error;
    }

    const deps = module.deps;
    if (deps.length > 0) {
      // noinspection ES6MissingAwait
      this.dispatch(ModuleDepsInitEvent, new ModuleDepsInitEvent(name));
      const depsLoadStartTime = new Date().getTime();
      for (const it of deps) {
        await this.initModule(it);
      }
      // noinspection ES6MissingAwait
      this.dispatch(ModuleDepsInitializedEvent, new ModuleDepsInitializedEvent(name, new Date().getTime() - depsLoadStartTime));
    }

    try {
      await module.init();
    } catch (e) {
      // noinspection ES6MissingAwait
      this.dispatch(ModuleFailedEvent, new ModuleFailedEvent(name, e as Error));
      throw e;
    }

    this.initializedModules.push(name);
    // noinspection ES6MissingAwait
    this.dispatch(ModuleInitializedEvent, new ModuleInitializedEvent(name, new Date().getTime() - loadStartTime));
  }
}
