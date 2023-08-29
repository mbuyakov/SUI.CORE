import {SuiModule} from "./SuiModule";

export abstract class SuiModuleWithSettings<T> extends SuiModule {
    protected readonly settings: T;

    public constructor(settings: T) {
        super();
        this.settings = settings;
    }
}
