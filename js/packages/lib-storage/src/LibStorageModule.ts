import {Container} from "@sui/deps-ioc";
import {SuiModule} from "@sui/lib-module-manager";
import {LocalStorageService, LocalStorageServiceImpl} from "./LocalStorageService";

export class LibStorageModule extends SuiModule {
    protected getName(): string {
        return "LibStorageModule";
    }

    override async init(): Promise<void> {
        Container.bind(LocalStorageService).to(LocalStorageServiceImpl);
    }
}
