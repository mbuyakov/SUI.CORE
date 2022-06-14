import {createMuiTheme} from "@material-ui/core/styles";
import {ThemesConfig} from "@/themes/types";

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
        },
        MuiTooltip: {
          tooltip: {
            fontSize: "1em",
          },
        }
      }
    })
  },
  light: {
    materialThemeConfig: {
      palette: {
        type: "light",
        background: {
          default: "#f0f2f5" // Match antd
        }
      },
      overrides: {
        MuiInput: {
          input: {
            "&:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 1000px white inset" //Disable autofill
            }
          }
        }
      }
    },
    baseTableMaterialThemeConfig: {
      palette: {
        action: {
          selected: "#0000FF" // For highlighted row
        }
      }
    },
    // Antd style
    drawerMaterialThemeConfig: {
      palette: {
        text: {
          primary: "hsla(0,0%,100%,.65)",
          secondary: "#FFF" // Highlight hover
        },
        background: {
          paper: "#001529",
          default: "#000c17"
        }
      }
    }
  },
  dark: {
    materialThemeConfig: {
      palette: {
        type: "dark",
        background: {
          default: "#000000", // Match antd
          paper: "#141414"
        }
      },
      overrides: {
        MuiInput: {
          input: {
            "&:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 1000px #141414 inset", //Disable autofill
              WebkitTextFillColor: "white"
            }
          }
        }
      }
    },
    // Antd style
    drawerMaterialThemeConfig: {
      palette: {
        text: {
          secondary: "#FFF" // Highlight hover
        }
      }
    }
  }
};
