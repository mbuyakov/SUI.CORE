import {ModuleErrorEvent, ModuleEvent, ModuleWithDurationEvent} from "./moduleEventTypes";

export class ModuleDiscoveredEvent extends ModuleEvent {
  constructor(moduleName: string) {
    super("ModuleDiscoveredEvent", moduleName);
  }
}

export class ModuleInitEvent extends ModuleEvent {
  constructor(moduleName: string) {
    super("ModuleInitEvent", moduleName);
  }
}

export class ModuleDepsInitEvent extends ModuleEvent {
  constructor(moduleName: string) {
    super("ModuleDepsInitEvent", moduleName);
  }
}

export class ModuleDepsInitializedEvent extends ModuleWithDurationEvent {
  constructor(moduleName: string, duration: number) {
    super("ModuleDepsLoadedEvent", moduleName, duration);
  }
}

export class ModuleInitializedEvent extends ModuleWithDurationEvent {
  constructor(moduleName: string, duration: number) {
    super("ModuleInitializedEvent", moduleName, duration);
  }
}

export class ModuleFailedEvent extends ModuleErrorEvent {
  public readonly error: string | Error;

  constructor(moduleName: string, error: string | Error) {
    super("ModuleFailedEvent", moduleName);
    this.error = error;
  }
}

export class ModuleDuplicateEvent extends ModuleErrorEvent {
  constructor(moduleName: string) {
    super("ModuleDuplicateEvent", moduleName);
  }
}
