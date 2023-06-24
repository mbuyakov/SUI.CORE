import * as stringFormatters from "./stringFormatters";

test("CamelCase null", () => {
  expect(stringFormatters.camelCase(null)).toBe("");
});
test('CamelCase " "', () => {
  expect(stringFormatters.camelCase(" ")).toBe("");
});
test("CamelCase a", () => {
  expect(stringFormatters.camelCase("a")).toBe("a");
});
test("CamelCase a_b", () => {
  expect(stringFormatters.camelCase("a_b")).toBe("aB");
});
test("CamelCase a-b", () => {
  expect(stringFormatters.camelCase("a-b")).toBe("aB");
});

test("Capitalize null", () => {
  expect(stringFormatters.capitalize(null)).toBe("");
});
test('Capitalize " "', () => {
  expect(stringFormatters.capitalize(" ")).toBe(" ");
});
test("Capitalize a", () => {
  expect(stringFormatters.capitalize("a")).toBe("A");
});
test("Capitalize A", () => {
  expect(stringFormatters.capitalize("A")).toBe("A");
});
test("Capitalize Aa", () => {
  expect(stringFormatters.capitalize("aA")).toBe("AA");
});
test("Capitalize AA", () => {
  expect(stringFormatters.capitalize("AA")).toBe("AA");
});
test("Capitalize aa", () => {
  expect(stringFormatters.capitalize("aa")).toBe("Aa");
});

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
test("Add plural ending class", () => {
  expect(stringFormatters.addPluralEnding("class")).toBe("classes");
});
test("Add plural ending person (exclusion)", () => {
  expect(stringFormatters.addPluralEnding("person")).toBe("people");
});
test("Add plural ending docPerson (exclusion)", () => {
  expect(stringFormatters.addPluralEnding("docPerson")).toBe("docPeople");
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
test("Remove plural ending classes", () => {
  expect(stringFormatters.removePluralEnding("classes")).toBe("class");
});
test("Remove plural ending people", () => {
  expect(stringFormatters.removePluralEnding("people")).toBe("person");
});
test("Remove plural ending docPeople", () => {
  expect(stringFormatters.removePluralEnding("docPeople")).toBe("docPerson");
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
test('Line feed screening "\\n\\t"', () => {
  expect(stringFormatters.lineFeedScreening("\n\t")).toBe("\\n\\t");
});

test("Quote screening null", () => {
  expect(stringFormatters.quoteScreening(null)).toBe("");
});
test('Quote screening " "', () => {
  expect(stringFormatters.quoteScreening(" ")).toBe(" ");
});
test('Quote screening "\\"\\""', () => {
  expect(stringFormatters.quoteScreening("\"\"")).toBe("\\\"\\\"");
});

test("Format raw for GraphQL null", () => {
  expect(stringFormatters.formatRawForGraphQL(null)).toBe("");
});
test('Format raw for GraphQL " "', () => {
  expect(stringFormatters.formatRawForGraphQL(" ")).toBe(" ");
});
test('Format raw for GraphQL "\\n\\""', () => {
  expect(stringFormatters.formatRawForGraphQL("\n\"")).toBe("\\n\\\"");
});
test('Format raw for GraphQL "\\t\\""', () => {
  expect(stringFormatters.formatRawForGraphQL("\t\"")).toBe("\\t\\\"");
});
test('Format raw for GraphQL "\\n\\t\\""', () => {
  expect(stringFormatters.formatRawForGraphQL("\n\t\"")).toBe("\\n\\t\\\"");
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
