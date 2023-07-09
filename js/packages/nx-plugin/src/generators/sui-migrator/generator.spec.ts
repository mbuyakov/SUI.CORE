import {remapOldPackages} from "./modules/remapOldPackages";

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
import {DataKey, Test} from "@sui/ui-old-react";
import {dataKeysToDataTree} from "@sui/ui-old-core";

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

const afterRemapOldPackages = `
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
import {DataKey} from "@sui/util-chore";
import {Test} from "@sui/ui-old-react";
import {dataKeysToDataTree} from "@sui/util-chore";

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
  it("remapOldPackages", () => {
    expect(remapOldPackages("@sui/deps-antd", afterRemapIcons).trim()).toBe(afterRemapOldPackages);
  });
});
