import {SingletonAndOnlyIoc} from "./SingletonAndOnlyIoc";
import {Container} from "typescript-ioc";

class SmthClass {

}

const _SmthClass = SingletonAndOnlyIoc(SmthClass);

describe('SingletonAndOlyIoc', () => {
  test('OnlyInstantiableByContainer check', () => {
    expect(() => new _SmthClass()).toThrow('The instantiation is blocked for this class');
  });

  test('Singleton check', () => {
    const smthClass1 = Container.get(_SmthClass);
    const smthClass2 = Container.get(_SmthClass);
    expect(smthClass1).toBeDefined();
    expect(smthClass1).toBe(smthClass2);
  });
})
