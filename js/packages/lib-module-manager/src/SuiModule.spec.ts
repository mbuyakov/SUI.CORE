import {SuiModule} from "./SuiModule";

class Module1 extends SuiModule {
    protected getName(): string {
        return "Module1";
    }
}

class Module2 extends SuiModule {
    protected getName(): string {
        return "Module2";
    }


    protected override getDeps(): SuiModule[] {
        return [new Module1()];
    }
}

describe("SuiModule", () => {
    test("should save name in class field", () => {
        expect(new Module1().name).toBe("Module1");
    });

    test("should save deps in class field", () => {
        expect(new Module2().deps).toEqual(["Module1"]);
    });
});
