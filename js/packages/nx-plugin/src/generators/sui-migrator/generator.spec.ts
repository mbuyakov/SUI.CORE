import {remapImports} from "./generator";

describe("sui-migrator generator", () => {
  it("remapImports", () => {
    const prev = `
    import {test1} from "@nemui/material";
    import {test2} from "@mui/material";
    import {test3} from "antd";
    `;

    expect(remapImports("@sui/deps-antd", prev)).toBe(`
    import {test1} from "@nemui/material";
    import {test2} from "@sui/deps-material";
    import {test3} from "antd";
    `);
  });
});
