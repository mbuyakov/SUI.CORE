import {SuiEvent} from "@sui/lib-event-manager";

export abstract class ModuleEvent extends SuiEvent {
  public readonly moduleName: string;

  protected constructor(name: string, moduleName: string) {
    super(name);
    this.moduleName = moduleName;
  }
}

export abstract class ModuleErrorEvent extends ModuleEvent {

}

export abstract class ModuleWithDurationEvent extends ModuleEvent {
  public readonly duration: number;

  protected constructor(name: string, moduleName: string, duration: number) {
    super(name, moduleName);
    this.duration = duration;
  }
}
