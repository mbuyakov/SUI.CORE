import {ThemesConfig} from "@/themes/types";
import {createMuiTheme} from "@material-ui/core/styles";

export const defaultMuiTheme = createMuiTheme();

export const defaultThemesConfig: ThemesConfig = {
  common: {
    lessVars: {
      'layout-header-height': '48px',
      'card-padding-wider': '24px',
      "primary-color": "#56CBF8",
      "info-color": "#56CBF8",
      "error-color": "#FF6565",
      "highlight-color": "#FF6565",
      "success-color": "#A2E8AB",
      "warning-color": "#FCF69B",
      "border-radius-base": "8px",
      "btn-border-radius-sm": "6px",
      "btn-border-width": "2px",
      "font-size-base": "15px",
      "btn-font-size-sm": "14px",
      "border-color-base": "rgba(217, 217, 217, 0.6)",
      "btn-shadow": "none"
    },
    materialThemeConfig: muiDefaultTheme => ({
      palette: {
        primary: {
          main: "#56CBF8",
          contrastText: "#FFFFFF"
        }
      },
      overrides: {
        MuiToolbar: {
          gutters: {
            [muiDefaultTheme.breakpoints.up('sm')]: {
              paddingLeft: muiDefaultTheme.spacing(2), // 3 -> 2
              paddingRight: muiDefaultTheme.spacing(2)
            }
          }
        }
      }
    })
  },
  light: {
    materialThemeConfig: {
      palette: {
        type: "light"
      }
    },
    baseTableMaterialThemeConfig: {
      palette: {
        action: {
          selected: "#0000FF" // For highlighted row
        }
      }
    }
  },
  dark: {
    materialThemeConfig: {
      palette: {
        type: "dark"
      }
    }
  }
};
