import {ModuleManager} from "./ModuleManager";
import {SuiModule} from "./SuiModule";
import {ModuleDepsInitEvent, ModuleDepsInitializedEvent, ModuleDiscoveredEvent, ModuleDuplicateEvent, ModuleFailedEvent, ModuleInitEvent, ModuleInitializedEvent} from "./event";
import * as React from "react";

class Module1 extends SuiModule {
  constructor() {
    super("Module1");
  }

  override modifyRoot(root: React.ReactNode): React.ReactNode {
    return super.modifyRoot(root + "a");
  }
}

class Module2 extends SuiModule {
  constructor() {
    super("Module2", ["Module1"]);
  }
  override modifyRoot(root: React.ReactNode): React.ReactNode {
    return super.modifyRoot(root + "b");
  }
}

class DuplicatedModule extends SuiModule {
  constructor() {
    super("DuplicatedModule");
  }
}

class FailedModule extends SuiModule {
  constructor() {
    super("FailedModule");
  }

  override init(): Promise<void> {
    throw new Error("I'm failed");
  }
}

describe('ModuleManager', () => {
  test('Module with deps', async () => {
    const moduleManager = new ModuleManager("test", "test");
    const discoveredEventHandler = jest.fn();
    const moduleInitEventHandler = jest.fn();
    const depsInitEventHandler = jest.fn();
    const depsInitializedEventHandler = jest.fn();
    const moduleInitializedEventHandler = jest.fn();
    moduleManager.addHandler(ModuleDiscoveredEvent, discoveredEventHandler);
    moduleManager.addHandler(ModuleInitEvent, moduleInitEventHandler);
    moduleManager.addHandler(ModuleInitializedEvent, moduleInitializedEventHandler);
    moduleManager.addHandler(ModuleDepsInitEvent, depsInitEventHandler);
    moduleManager.addHandler(ModuleDepsInitializedEvent, depsInitializedEventHandler);
    moduleManager.addModule(new Module1());
    moduleManager.addModule(new Module2());
    await expect(moduleManager.init()).resolves.not.toBeDefined();
    expect(discoveredEventHandler).toBeCalledTimes(2);
    expect(moduleInitEventHandler).toBeCalledTimes(3);
    expect(depsInitEventHandler).toBeCalledTimes(2);
    expect(depsInitializedEventHandler).toBeCalledTimes(2);
    expect(moduleInitializedEventHandler).toBeCalledTimes(3);
  });

  test('Failed module event fired', async () => {
    const moduleManager = new ModuleManager("test", "test");
    const failedEventHandler = jest.fn();
    moduleManager.addHandler(ModuleFailedEvent, failedEventHandler);
    moduleManager.addModule(new FailedModule());
    await expect(moduleManager.init()).rejects.toThrow("I'm failed")
    expect(failedEventHandler).toBeCalledTimes(1);
  });

  test('Duplicated module event fired', async () => {
    const moduleManager = new ModuleManager("test", "test");
    const duplicatedEventHandler = jest.fn();
    moduleManager.addHandler(ModuleDuplicateEvent, duplicatedEventHandler);
    moduleManager.addModule(new DuplicatedModule());
    expect(() => moduleManager.addModule(new DuplicatedModule())).toThrow("Module DuplicatedModule has duplicate");
    expect(duplicatedEventHandler).toBeCalledTimes(1);
  });

  test('Root modified by modules', async () => {
    const moduleManager = new ModuleManager("test", "test");
    moduleManager.addModule(new Module1());
    moduleManager.addModule(new Module2());
    await moduleManager.init();
    const modifiedRoot = moduleManager.modifyRoot("root");
    expect(modifiedRoot).toBe("rootab");
  });
});
