import {remapDeprecated} from "./remapDeprecated";

describe("remap deprecated", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should leave as is", () => {
    const consoleLog = jest.spyOn(console, "log");
    const source = `
import React from "react";
const a: React.JSX.Element = null;
    `.trim();
    expect(remapDeprecated(source)).toBe(source);
    expect(consoleLog).not.toBeCalled();
  });

  it("should replace JSX", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(remapDeprecated(`
import smth from "smth";
const a: JSX.Element = null;
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should leave import as is (default import)", () => {
    const consoleLog = jest.spyOn(console, "log");
    const source = `
import React from "react";
const a: JSX.Element = null;
    `.trim();
    expect(remapDeprecated(source)).toBe(source.replace("JSX.Element", "React.JSX.Element"));
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should leave import as is (namespace import)", () => {
    const consoleLog = jest.spyOn(console, "log");
    const source = `
import React from "react";
const a: JSX.Element = null;
    `.trim();
    expect(remapDeprecated(source)).toBe(source.replace("JSX.Element", "React.JSX.Element"));
    expect(consoleLog).toBeCalledTimes(1);
  });
});
