import * as queryGenerator from "./index";

test("GenerateUpdateText", () => {
  ["teSt", "te_st"].forEach(entity => {
    expect(queryGenerator.generateUpdateText(entity, "1", "f", false)).toBe(`mutation {
  updateTeStById(input: {id: "1", teStPatch: {f: false}}) {
    clientMutationId
  }
}`);
    expect(queryGenerator.generateUpdateText(entity, 1, "f", false)).toBe(`mutation {
  updateTeStById(input: {id: 1, teStPatch: {f: false}}) {
    clientMutationId
  }
}`);
    expect(queryGenerator.generateUpdateText(entity, "1", "f", 1)).toBe(`mutation {
  updateTeStById(input: {id: "1", teStPatch: {f: 1}}) {
    clientMutationId
  }
}`);
    expect(queryGenerator.generateUpdateText(entity, "1", "f", "1")).toBe(`mutation {
  updateTeStById(input: {id: "1", teStPatch: {f: "1"}}) {
    clientMutationId
  }
}`);
  });
});

test("GenerateCreateText", () => {
  ["teSt", "te_st"].forEach(entity => {
    expect(
      queryGenerator.generateCreateText(entity, {
        field1: false,
        fields2: 1,
        fields3: "1",
      }),
    ).toBe(`mutation {
  createTeSt(input: {teSt: {field1: false,fields2: 1,fields3: "1"}}) {
    teSt {
      id
    }
  }
}`);
  });
});


test("GenerateDeleteText", () => {
  ["teSt", "te_st"].forEach(entity => {
    expect(
      queryGenerator.generateDeleteText(entity, "123"),
    ).toBe(`mutation {
  deleteTeStById(input: {id: "123"}) {
    clientMutationId
  }
}`);
  });
});
