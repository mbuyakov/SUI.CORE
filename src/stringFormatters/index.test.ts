/* tslint:disable:no-import-side-effect no-implicit-dependencies typedef no-null-keyword */
import * as chai from "chai";
import "mocha";

import * as stringFormatters from "./index";

describe("StringFormatters", () => {
  it("Uncapitalize null", () => {
    chai.assert.equal(stringFormatters.unCapitalize(null), "");
  });

  it("Uncapitalize \" \"", () => {
    chai.assert.equal(stringFormatters.unCapitalize(" "), " ");
  });
  it("Uncapitalize a", () => {
    chai.assert.equal(stringFormatters.unCapitalize("a"), "a");
  });
  it("Uncapitalize A", () => {
    chai.assert.equal(stringFormatters.unCapitalize("A"), "a");
  });
  it("Uncapitalize Aa", () => {
    chai.assert.equal(stringFormatters.unCapitalize("Aa"), "aa");
  });
  it("Uncapitalize AA", () => {
    chai.assert.equal(stringFormatters.unCapitalize("AA"), "AA");
  });

  it("Add plural ending null", () => {
    chai.assert.equal(stringFormatters.addPluralEnding(null), "");
  });

  it("Add plural ending \" \"", () => {
    chai.assert.equal(stringFormatters.addPluralEnding(" "), " ");
  });

  it("Add plural ending a", () => {
    chai.assert.equal(stringFormatters.addPluralEnding("a"), "as");
  });

  it("Add plural ending y", () => {
    chai.assert.equal(stringFormatters.addPluralEnding("y"), "ies");
  });

  it("Remove plural ending null", () => {
    chai.assert.equal(stringFormatters.removePluralEnding(null), "");
  });

  it("Remove plural ending \" \"", () => {
    chai.assert.equal(stringFormatters.removePluralEnding(" "), " ");
  });

  it("Remove plural ending as", () => {
    chai.assert.equal(stringFormatters.removePluralEnding("as"), "a");
  });

  it("Remove plural ending ies", () => {
    chai.assert.equal(stringFormatters.removePluralEnding("ies"), "y");
  });

  it("Format SQL timestamp null", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestamp(null), "");
  });

  it("Format SQL timestamp \" \"", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestamp(" "), " ");
  });

  it("Format SQL timestamp 2019-01-01T23:59:59.99999", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestamp("2019-01-01T23:59:59.99999"), "2019-01-01 23:59:59");
  });

  it("Format SQL timestamp aaaa", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestamp("aaaa"), "aaaa");
  });

  it("Format SQL timestamp to date null", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToDate(null), "");
  });

  it("Format SQL timestamp to date \" \"", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToDate(" "), " ");
  });

  it("Format SQL timestamp to date 2019-01-01T23:59:59.99999", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToDate("2019-01-01T23:59:59.99999"), "2019-01-01");
  });

  it("Format SQL timestamp to date aaaa", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToDate("aaaa"), "aaaa");
  });

  it("Format SQL timestamp to time null", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToTime(null), "");
  });

  it("Format SQL timestamp to time \" \"", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToTime(" "), " ");
  });

  it("Format SQL timestamp to time 2019-01-01T23:59:59.99999", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToTime("2019-01-01T23:59:59.99999"), "23:59:59");
  });

  it("Format SQL timestamp to time aaaa", () => {
    chai.assert.equal(stringFormatters.formatSqlTimestampToTime("aaaa"), "aaaa");
  });

  it("Line feed screening null", () => {
    chai.assert.equal(stringFormatters.lineFeedScreening(null), "");
  });

  it("Line feed screening \" \"", () => {
    chai.assert.equal(stringFormatters.lineFeedScreening(" "), " ");
  });

  it("Line feed screening \"\\n\\n\"", () => {
    chai.assert.equal(stringFormatters.lineFeedScreening("\n\n"), "\\n\\n");
  });

  it("Add quotes if string null", () => {
    chai.assert.equal(stringFormatters.addQuotesIfString(null), null);
  });

  it("Add quotes if string \" \"", () => {
    chai.assert.equal(stringFormatters.addQuotesIfString(" "), "\" \"");
  });

  it("Trim if string null", () => {
    chai.assert.equal(stringFormatters.trimIfString(null), null);
  });

  it("Trim if string \" \"", () => {
    chai.assert.equal(stringFormatters.trimIfString(" "), "");
  });
});
