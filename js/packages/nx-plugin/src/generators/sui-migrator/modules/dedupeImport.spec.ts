import {dedupeImport} from "./dedupeImport";

describe("dedupe import", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should leave as is", () => {
    const consoleLog = jest.spyOn(console, "log");
    const source = `
import {a} from "a";
import {b as b} from "b";
import c from "c";
import * as d from "d";
import "a";
    `.trim();
    expect(dedupeImport(source)).toBe(source);
    expect(consoleLog).not.toBeCalled();
  });

  it("should leave as in named import & namespace", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(dedupeImport(`
import {a} from "a";
import {b as b} from "b";
import c from "c";
import * as d from "a";
import "a";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(0);
  });

  it("should merge multiple named import", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(dedupeImport(`
import {a} from "a";
import {b as b} from "a";
import c from "c";
import * as d from "d";
import "a";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should merge named import & default", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(dedupeImport(`
import {a} from "a";
import {b as b} from "b";
import c from "a";
import * as d from "d";
import "a";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should merge named import & default + namespace on next line", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(dedupeImport(`
import {a} from "a";
import {b as b} from "a";
import {f} from "b";
import c from "a";
import * as d from "a";
import "a";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should merge two same import", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(dedupeImport(`
import React from "react";
import React from "react";
    `).trim()).toBe(`
import React from "react";
    `.trim());
    expect(consoleLog).toBeCalledTimes(1);
  });
});
