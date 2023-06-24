import { Container } from "@sui/deps-ioc";
import {SuiModule} from "@sui/lib-module-manager";
import {LocalStorageService, LocalStorageServiceImpl} from "./LocalStorageService";

export class LocalStorageModule extends SuiModule {

  constructor() {
    super("LocalStorageModule", []);
    Container.bind(LocalStorageService).to(LocalStorageServiceImpl);
  }
}
