import {AntdTheme, MuiTheme, SuiThemeConfig} from "./types";
import {createTheme as muiCreateTheme} from "@sui/deps-material";

const PRIMARY_COLOR = "#56CBF8"

export const suiDefaultTheme: SuiThemeConfig = {
  common: {
    base: {
      antd: (base, theme) => ({
        ...base,
        token: {
          ...base.token,
          colorPrimary: PRIMARY_COLOR
        }
      }),
      mui: (base, createTheme) => createTheme({
        ...base,
        palette: {
          ...base.palette,
          primary: {
            ...base.palette.primary,
            main: PRIMARY_COLOR
          }
        }
      })
    }
  },
  dark: {
    base: {
      mui: (base, createTheme) => createTheme({
        ...base,
        palette: {
          // ...base.palette, - break dark palette
          mode: "dark",
          primary: {
            main: PRIMARY_COLOR
          }
        }
      }),
      antd: (base, theme) => ({
        ...base,
        algorithm: theme.darkAlgorithm
      })
    }
  }
};

export const muiDefaultTheme: MuiTheme = muiCreateTheme();

export const antdDefaultTheme: AntdTheme = {
  token: {},
  components: {}
};
