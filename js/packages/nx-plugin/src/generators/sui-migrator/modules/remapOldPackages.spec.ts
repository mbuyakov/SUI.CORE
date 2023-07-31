import {remapOldPackages} from "./remapOldPackages";

describe("remap old imports", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should replace old import", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(remapOldPackages("@sui/deps-antd", `
import {DataKey, Test} from "@sui/ui-old-react";
import {dataKeysToDataTree} from "@sui/ui-old-core";
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(2);
  });
});
