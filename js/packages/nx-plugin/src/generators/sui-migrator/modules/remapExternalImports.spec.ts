import {remapExternalImports} from "./remapExternalImports";

describe("remap external imports", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should leave as is", () => {
    const consoleLog = jest.spyOn(console, "log");
    const source = `
import {a} from "@sui/deps-material";
import {b} from "antd";
    `.trim();
    expect(remapExternalImports("@sui/deps-antd",source)).toBe(source);
    expect(consoleLog).not.toBeCalled();
  });

  it("should replace default import from subpath", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(remapExternalImports("@sui/deps-antd", `
import Button from "@mui/material/Button";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should replace named import", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(remapExternalImports("@sui/deps-antd",`
import {Button} from "@mui/material";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });
});
