import {SingletonAndOnlyIoc} from "./SingletonAndOnlyIoc";
import {Container} from "typescript-ioc";

class SmthClass {

}

class SmthClassImpl extends SmthClass {

}



const _SmthClass = SingletonAndOnlyIoc(SmthClass);

describe("SingletonAndOlyIoc", () => {
  test("OnlyInstantiableByContainer check", () => {
    expect(() => new _SmthClass()).toThrow("The instantiation is blocked for this class");
  });

  test("Singleton check", () => {
    const smthClass1 = Container.get(_SmthClass);
    const smthClass2 = Container.get(_SmthClass);
    expect(smthClass1).toBeDefined();
    expect(smthClass1).toBe(smthClass2);
    expect(smthClass1 instanceof SmthClass).toBe(true);
    expect(smthClass1 instanceof SmthClassImpl).toBe(false);

  });

  test("Singleton with impl check", () => {
    Container.bind(_SmthClass).to(SmthClassImpl);
    const smthClass1 = Container.get(_SmthClass);
    const smthClass2 = Container.get(_SmthClass);
    expect(smthClass1).toBeDefined();
    expect(smthClass1).toBe(smthClass2);
    expect(smthClass1 instanceof SmthClass).toBe(true);
    expect(smthClass1 instanceof SmthClassImpl).toBe(true);
  });
});
