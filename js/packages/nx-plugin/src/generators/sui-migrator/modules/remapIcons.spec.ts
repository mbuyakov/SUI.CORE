import {remapIcons} from "./remapIcons";

describe("remap icons", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should leave as is", () => {
    const consoleLog = jest.spyOn(console, "log");
    const source = `
import {MuiIcons} from "@sui/deps-material";

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
    expect(remapIcons(source)).toBe(source);
    expect(consoleLog).not.toBeCalled();
  });

  it("should replace default import from subpath", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(remapIcons(`
import MenuIcon from "@mui/icons-material/Menu";

const a = <MenuIcon attr="1">2</MenuIcon>;
const b = <MenuIcon attr="1"/>;
const c = <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MenuIcon/>}
          />;
const d = MenuIcon as any;
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  it("should replace named import", () => {
    const consoleLog = jest.spyOn(console, "log");
    expect(remapIcons(`
import {DeleteForever} from "@mui/icons-material";

const a = <DeleteForever attr="1">2</DeleteForever>;
const b = <DeleteForever attr="1"/>;
const c = <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <DeleteForever/>}
          />;
const d = DeleteForever as any;
    `.trim())).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });
});
