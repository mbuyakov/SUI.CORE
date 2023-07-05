import {remapImports} from "./generator";

describe("sui-migrator generator", () => {
  it("remapImports", () => {
    const prev = `
import {test1} from "@nemui/material";
import {test2} from "@mui/material";
import {test3} from "antd";
import {test4} from "@mui/material/test";
import {test5, test6} from "@mui/material/test";
import test7 from "@mui/material/test";
    `.trim();
    const after = `
import {test1} from "@nemui/material";
import { test2 } from "@sui/deps-material";
import {test3} from "antd";
import { test4 } from "@sui/deps-material";
import { test5, test6 } from "@sui/deps-material";
import { test7 } from "@sui/deps-material";
    `.trim();
    expect(remapImports("deps-antd", prev).trim()).toBe(after);
  });
});
