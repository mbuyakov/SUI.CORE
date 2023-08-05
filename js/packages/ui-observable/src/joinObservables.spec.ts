import {Observable} from "./Observable";
import {
  joinObservables2,
  joinObservables3,
  joinObservables4,
  joinObservables5,
  joinObservables6
} from "./joinObservables";

describe("joinObservables", () => {

  it("joinObservable2", () => {
    const observable1 = new Observable("-1");
    const observable2 = new Observable("-2");
    const join = joinObservables2(observable1, observable2);
    expect(join.getValue()).toStrictEqual(["-1", "-2"]);
    observable1.setValue("1");
    expect(join.getValue()).toStrictEqual(["1", "-2"]);
    observable2.setValue("2");
    expect(join.getValue()).toStrictEqual(["1", "2"]);
  });

  it("joinObservable3", () => {
    const observable1 = new Observable("-1");
    const observable2 = new Observable("-2");
    const observable3 = new Observable("-3");
    const join = joinObservables3(observable1, observable2, observable3);
    expect(join.getValue()).toStrictEqual(["-1", "-2", "-3"]);
    observable1.setValue("1");
    expect(join.getValue()).toStrictEqual(["1", "-2", "-3"]);
    observable2.setValue("2");
    expect(join.getValue()).toStrictEqual(["1", "2", "-3"]);
    observable3.setValue("3");
    expect(join.getValue()).toStrictEqual(["1", "2", "3"]);
  });

  it("joinObservable4", () => {
    const observable1 = new Observable("-1");
    const observable2 = new Observable("-2");
    const observable3 = new Observable("-3");
    const observable4 = new Observable("-4");
    const join = joinObservables4(observable1, observable2, observable3, observable4);
    expect(join.getValue()).toStrictEqual(["-1", "-2", "-3", "-4"]);
    observable1.setValue("1");
    expect(join.getValue()).toStrictEqual(["1", "-2", "-3", "-4"]);
    observable2.setValue("2");
    expect(join.getValue()).toStrictEqual(["1", "2", "-3", "-4"]);
    observable3.setValue("3");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "-4"]);
    observable4.setValue("4");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "4"]);
  });

  it("joinObservable5", () => {
    const observable1 = new Observable("-1");
    const observable2 = new Observable("-2");
    const observable3 = new Observable("-3");
    const observable4 = new Observable("-4");
    const observable5 = new Observable("-5");
    const join = joinObservables5(observable1, observable2, observable3, observable4, observable5);
    expect(join.getValue()).toStrictEqual(["-1", "-2", "-3", "-4", "-5"]);
    observable1.setValue("1");
    expect(join.getValue()).toStrictEqual(["1", "-2", "-3", "-4", "-5"]);
    observable2.setValue("2");
    expect(join.getValue()).toStrictEqual(["1", "2", "-3", "-4", "-5"]);
    observable3.setValue("3");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "-4", "-5"]);
    observable4.setValue("4");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "4", "-5"]);
    observable5.setValue("5");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "4", "5"]);
  });

  it("joinObservable6", () => {
    const observable1 = new Observable("-1");
    const observable2 = new Observable("-2");
    const observable3 = new Observable("-3");
    const observable4 = new Observable("-4");
    const observable5 = new Observable("-5");
    const observable6 = new Observable("-6");
    const join = joinObservables6(observable1, observable2, observable3, observable4, observable5, observable6);
    expect(join.getValue()).toStrictEqual(["-1", "-2", "-3", "-4", "-5", "-6"]);
    observable1.setValue("1");
    expect(join.getValue()).toStrictEqual(["1", "-2", "-3", "-4", "-5", "-6"]);
    observable2.setValue("2");
    expect(join.getValue()).toStrictEqual(["1", "2", "-3", "-4", "-5", "-6"]);
    observable3.setValue("3");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "-4", "-5", "-6"]);
    observable4.setValue("4");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "4", "-5", "-6"]);
    observable5.setValue("5");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "4", "5", "-6"]);
    observable6.setValue("6");
    expect(join.getValue()).toStrictEqual(["1", "2", "3", "4", "5", "6"]);
  });
});
