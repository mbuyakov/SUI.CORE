/* tslint:disable:no-null-keyword */
import * as stringFormatters from "./index";

test("Uncapitalize null", () => {
  expect(stringFormatters.unCapitalize(null)).toBe("");
});

test('Uncapitalize " "', () => {
  expect(stringFormatters.unCapitalize(" ")).toBe(" ");
});
test("Uncapitalize a", () => {
  expect(stringFormatters.unCapitalize("a")).toBe("a");
});
test("Uncapitalize A", () => {
  expect(stringFormatters.unCapitalize("A")).toBe("a");
});
test("Uncapitalize Aa", () => {
  expect(stringFormatters.unCapitalize("Aa")).toBe("aa");
});
test("Uncapitalize AA", () => {
  expect(stringFormatters.unCapitalize("AA")).toBe("AA");
});

test("Add plural ending null", () => {
  expect(stringFormatters.addPluralEnding(null)).toBe("");
});

test('Add plural ending " "', () => {
  expect(stringFormatters.addPluralEnding(" ")).toBe(" ");
});

test("Add plural ending a", () => {
  expect(stringFormatters.addPluralEnding("a")).toBe("as");
});

test("Add plural ending y", () => {
  expect(stringFormatters.addPluralEnding("y")).toBe("ies");
});

test("Add plural ending status", () => {
  expect(stringFormatters.addPluralEnding("status")).toBe("statuses");
});

test("Remove plural ending null", () => {
  expect(stringFormatters.removePluralEnding(null)).toBe("");
});

test('Remove plural ending " "', () => {
  expect(stringFormatters.removePluralEnding(" ")).toBe(" ");
});

test("Remove plural ending as", () => {
  expect(stringFormatters.removePluralEnding("as")).toBe("a");
});

test("Remove plural ending ies", () => {
  expect(stringFormatters.removePluralEnding("ies")).toBe("y");
});

test("Remove plural ending statuses", () => {
  expect(stringFormatters.removePluralEnding("statuses")).toBe("status");
});

test("Format SQL timestamp null", () => {
  expect(stringFormatters.formatSqlTimestamp(null)).toBe("");
});

test('Format SQL timestamp " "', () => {
  expect(stringFormatters.formatSqlTimestamp(" ")).toBe(" ");
});

test("Format SQL timestamp 2019-01-01T23:59:59.99999", () => {
  expect(stringFormatters.formatSqlTimestamp("2019-01-01T23:59:59.99999")).toBe("2019-01-01 23:59:59");
});

test("Format SQL timestamp aaaa", () => {
  expect(stringFormatters.formatSqlTimestamp("aaaa")).toBe("aaaa");
});

test("Format SQL timestamp to date null", () => {
  expect(stringFormatters.formatSqlTimestampToDate(null)).toBe("");
});

test('Format SQL timestamp to date " "', () => {
  expect(stringFormatters.formatSqlTimestampToDate(" ")).toBe(" ");
});

test("Format SQL timestamp to date 2019-01-01T23:59:59.99999", () => {
  expect(stringFormatters.formatSqlTimestampToDate("2019-01-01T23:59:59.99999")).toBe("2019-01-01");
});

test("Format SQL timestamp to date aaaa", () => {
  expect(stringFormatters.formatSqlTimestampToDate("aaaa")).toBe("aaaa");
});

test("Format SQL timestamp to time null", () => {
  expect(stringFormatters.formatSqlTimestampToTime(null)).toBe("");
});

test('Format SQL timestamp to time " "', () => {
  expect(stringFormatters.formatSqlTimestampToTime(" ")).toBe(" ");
});

test("Format SQL timestamp to time 2019-01-01T23:59:59.99999", () => {
  expect(stringFormatters.formatSqlTimestampToTime("2019-01-01T23:59:59.99999")).toBe("23:59:59");
});

test("Format SQL timestamp to time aaaa", () => {
  expect(stringFormatters.formatSqlTimestampToTime("aaaa")).toBe("aaaa");
});

test("Line feed screening null", () => {
  expect(stringFormatters.lineFeedScreening(null)).toBe("");
});

test('Line feed screening " "', () => {
  expect(stringFormatters.lineFeedScreening(" ")).toBe(" ");
});

test('Line feed screening "\\n\\n"', () => {
  expect(stringFormatters.lineFeedScreening("\n\n")).toBe("\\n\\n");
});

test("Add quotes if string null", () => {
  expect(stringFormatters.addQuotesIfString(null)).toBe(null);
});

test('Add quotes if string " "', () => {
  expect(stringFormatters.addQuotesIfString(" ")).toBe('" "');
});

test("Trim if string null", () => {
  expect(stringFormatters.trimIfString(null)).toBe(null);
});

test('Trim if string " "', () => {
  expect(stringFormatters.trimIfString(" ")).toBe("");
});
