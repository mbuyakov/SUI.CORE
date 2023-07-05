import {remapIcons} from "./remapIcons";
import {remapImports} from "./remapImports";
import {dedupeImport} from "./dedupeImport";

const source = `
import {test1} from "@nemui/material";
import {test2} from "@mui/material";
import {test3} from "antd";
import {test4} from "@mui/material/test";
import {test5, test6} from "@mui/material/test";
import test7 from "@mui/material/test";
import {test8} from "antd";
import {test9} from "@mui/material-fake";
import {test10} from "antd/lib";
import MenuIcon from "@mui/icons-material/Menu";
import {DeleteForever} from "@mui/icons-material";
import {Container} from "typescript-ioc";
import * as colors from "colors";
import test11 from "colors";
import {test12} from "colors";
import "odometer/themes/odometer-theme-default.css";

const a = <MenuIcon attr="1">2</MenuIcon>;
const b = <MenuIcon attr="1"/>;

const c = <DeleteForever attr="1">2</DeleteForever>;
const d = <DeleteForever attr="1"/>;

const f = <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MenuIcon/>}
          />;
const g = MenuIcon as any;
    `.trim();

const afterRemapImports = `
import {test1} from "@nemui/material";
import {test2} from "@sui/deps-material";
import {test3} from "antd";
import {test4} from "@sui/deps-material";
import {test5, test6} from "@sui/deps-material";
import {test7} from "@sui/deps-material";
import {test8} from "antd";
import {test9} from "@mui/material-fake";
import {test10} from "antd/lib";
import MenuIcon from "@mui/icons-material/Menu";
import {DeleteForever} from "@mui/icons-material";
import {Container} from "@sui/deps-ioc";
import * as colors from "colors";
import test11 from "colors";
import {test12} from "colors";
import "odometer/themes/odometer-theme-default.css";

const a = <MenuIcon attr="1">2</MenuIcon>;
const b = <MenuIcon attr="1"/>;

const c = <DeleteForever attr="1">2</DeleteForever>;
const d = <DeleteForever attr="1"/>;

const f = <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MenuIcon/>}
          />;
const g = MenuIcon as any;
    `.trim();

const afterRemapIcons = `
import {MuiIcons} from "@sui/deps-material";
import {test1} from "@nemui/material";
import {test2} from "@sui/deps-material";
import {test3} from "antd";
import {test4} from "@sui/deps-material";
import {test5, test6} from "@sui/deps-material";
import {test7} from "@sui/deps-material";
import {test8} from "antd";
import {test9} from "@mui/material-fake";
import {test10} from "antd/lib";
import {Container} from "@sui/deps-ioc";
import * as colors from "colors";
import test11 from "colors";
import {test12} from "colors";
import "odometer/themes/odometer-theme-default.css";

const a = <MuiIcons.Menu attr="1">2</MuiIcons.Menu>;
const b = <MuiIcons.Menu attr="1"/>;

const c = <MuiIcons.DeleteForever attr="1">2</MuiIcons.DeleteForever>;
const d = <MuiIcons.DeleteForever attr="1"/>;

const f = <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MuiIcons.Menu/>}
          />;
const g = MuiIcons.Menu as any;
    `.trim();

const afterDedupeImport = `
import {MuiIcons, test2, test4, test5, test6, test7} from "@sui/deps-material";
import {test1} from "@nemui/material";
import {test3, test8} from "antd";
import {test9} from "@mui/material-fake";
import {test10} from "antd/lib";
import {Container} from "@sui/deps-ioc";
import test11, {test12} from "colors";
import * as colors from "colors";
import "odometer/themes/odometer-theme-default.css";

const a = <MuiIcons.Menu attr="1">2</MuiIcons.Menu>;
const b = <MuiIcons.Menu attr="1"/>;

const c = <MuiIcons.DeleteForever attr="1">2</MuiIcons.DeleteForever>;
const d = <MuiIcons.DeleteForever attr="1"/>;

const f = <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MuiIcons.Menu/>}
          />;
const g = MuiIcons.Menu as any;
    `.trim();

describe("sui-migrator generator", () => {
  it("remapImports", () => {
    expect(remapImports("deps-antd", source).trim()).toBe(afterRemapImports);
  });

  it("remapIcons", () => {
    expect(remapIcons(afterRemapImports).trim()).toBe(afterRemapIcons);
  });

  it("dedupeImport", () => {
    expect(dedupeImport(afterRemapIcons).trim()).toBe(afterDedupeImport);
  });
});
