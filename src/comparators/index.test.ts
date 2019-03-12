/* tslint:disable:no-import-side-effect no-implicit-dependencies typedef no-null-keyword */
import * as chai from "chai";
import "mocha";

import * as comparators from "./index";

describe("Comparators", () => {
  it("[number] Compare null null", () => {
    chai.assert.equal(comparators.numberComparator(null, null), 0);
  });

  it("[number] Compare \"\" null", () => {
    chai.assert.equal(comparators.numberComparator("", null), 0);
  });

  it("[number] Compare \"1\" null", () => {
    chai.assert.equal(comparators.numberComparator("1", null), 1);
  });

  it("[number] Compare \"2.23\" 3", () => {
    chai.assert.equal(comparators.numberComparator("2.23", 3), -0.77);
  });
});
