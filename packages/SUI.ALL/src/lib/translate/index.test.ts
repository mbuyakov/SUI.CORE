/* tslint:disable:no-null-keyword */
import * as translate from "./index";

test("Translate", () => {
  expect(translate.translate("asd")).toBe("asd");
  expect(translate.translate("asd", true)).toBe(null);
  translate.addTranslate("asd", "asd2");
  expect(translate.translate("asd")).toBe("asd2");
});
