import {SuiModuleWithSettings} from "./SuiModuleWithSettings";

class Module extends SuiModuleWithSettings<number> {
    protected getName(): string {
        return "Module";
    }
    public getSettings() {
        return this.settings;
    }
}

describe("SuiModuleWithSettings", () => {
    test("should save settings in class field", () => {
        expect(new Module(1).getSettings()).toBe(1);
    });
});
