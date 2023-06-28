import {SuiModule} from "@sui/lib-module-manager";

export class LibAuthModule extends SuiModule {
  public constructor() {
    super("LibAuthModule", ["LibStorageModule"]);
  }
}
