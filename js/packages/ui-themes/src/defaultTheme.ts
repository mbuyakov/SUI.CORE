import {AntdTheme, MuiTheme, SuiThemeConfig} from "./types";
import {createTheme as muiCreateTheme, PaletteOptions} from "@sui/deps-material";

const PRIMARY_COLOR = "#56CBF8";
const SECONDARY_COLOR = "#F50057";
const SUCCESS_COLOR = "#52C41A";
const WARNING_COLOR = "#FAAD14";
const ERROR_COLOR = "#FF4D4F";
const INFO_COLOR = "#4CB0D6";

const LIGHT_BACKGROUND_LAYOUT_COLOR = "#F0F2F5";
const LIGHT_BACKGROUND_CONTAINER_COLOR = "#FFFFFF";

const DARK_BACKGROUND_LAYOUT_COLOR = "#000000";
const DARK_BACKGROUND_CONTAINER_COLOR = "#141414";

const LIGHT_TEXT_PRIMARY_COLOR = "rgba(0, 0, 0, 0.87)";
const LIGHT_TEXT_SECONDARY_COLOR = "rgba(0, 0, 0, 0.6)";
const LIGHT_TEXT_DISABLED_COLOR = "rgba(0, 0, 0, 0.25)";

const DARK_TEXT_PRIMARY_COLOR = "rgba(255, 255, 255, 1)";
const DARK_TEXT_SECONDARY_COLOR = "rgba(255, 255, 255, 0.7)";
const DARK_TEXT_DISABLED_COLOR = "rgba(255, 255, 255, 0.5)";

const DEFAULT_BORDER_RADIUS = 8;
const DEFAULT_FONT_SIZE = 15;

const commonMuiPalette: PaletteOptions = {
  primary: {
    main: PRIMARY_COLOR,
    contrastText: "#FFF"
  },
  secondary: {
    main: SECONDARY_COLOR,
    contrastText: "#FFF"
  },
  success: {
    main: SUCCESS_COLOR,
    contrastText: "#FFF"
  },
  warning: {
    main: WARNING_COLOR,
    contrastText: "#FFF"
  },
  error: {
    main: ERROR_COLOR,
    contrastText: "#FFF"
  },
  info: {
    main: INFO_COLOR,
    contrastText: "#FFF"
  }
};

export const muiDefaultTheme: MuiTheme = muiCreateTheme();

export const antdDefaultTheme: AntdTheme = {
  token: {},
  components: {}
};

// See:
// https://ant.design/theme-editor
// https://zenoo.github.io/mui-theme-creator/
export const suiDefaultTheme: SuiThemeConfig = {
  common: {
    base: {
      antd: (base, theme) => ({
        ...base,
        components: {
          ...base.components,
          Button: {
            lineWidth: 2,
          }
        },
        token: {
          ...base.token,
          colorPrimary: PRIMARY_COLOR,
          colorSuccess: SUCCESS_COLOR,
          colorWarning: WARNING_COLOR,
          colorError: ERROR_COLOR,
          colorInfo: INFO_COLOR,
          colorHighlight: ERROR_COLOR,
          borderRadius: DEFAULT_BORDER_RADIUS,
          fontSize: DEFAULT_FONT_SIZE,
          // colorBorder: "rgba(217, 217, 217, 0.6)"
        }
      }),
      mui: (base, createTheme) => createTheme({
        ...base,
        components: {
          MuiDialog: {
            styleOverrides: {
              paperFullScreen: {
                // Ios. Leave statusbar as is
                marginTop: "env(safe-area-inset-top)",
                height: "calc(100% - env(safe-area-inset-top))",
                // Ios. Padding for bottom control
                paddingBottom: "env(safe-area-inset-bottom)"
              }
            }
          },
          MuiToolbar: {
            styleOverrides: {
              gutters: {
                [base.breakpoints.up("sm")]: {
                  paddingLeft: base.spacing(2), // 3 -> 2
                  paddingRight: base.spacing(2) // 3 -> 2
                }
              }
            }
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "1em"
              }
            }
          }
        },
        zIndex: (Object.keys(base.zIndex) as (keyof typeof base.zIndex)[]).reduce((prev, cur) => {
          prev[cur] = base.zIndex[cur] - 900;
          return prev;
        }, {} as typeof base.zIndex)
      })
    }
  },
  light: {
    base: {
      antd: (base) => {
        return {
          ...base,
          token: {
            ...base.token,
            colorBgLayout: LIGHT_BACKGROUND_LAYOUT_COLOR,
            colorBgContainer: LIGHT_BACKGROUND_CONTAINER_COLOR,
            colorText: LIGHT_TEXT_PRIMARY_COLOR,
            colorTextSecondary: LIGHT_TEXT_SECONDARY_COLOR,
            colorTextTertiary: LIGHT_TEXT_SECONDARY_COLOR,
            colorTextDisabled: LIGHT_TEXT_DISABLED_COLOR
          }
        };
      },
      mui: (base, createTheme) => createTheme({
        ...base,
        palette: {
          ...base.palette,
          ...commonMuiPalette,
          background: {
            default: LIGHT_BACKGROUND_LAYOUT_COLOR,
            paper: LIGHT_BACKGROUND_CONTAINER_COLOR
          },
          text: {
            primary: LIGHT_TEXT_PRIMARY_COLOR,
            secondary: LIGHT_TEXT_SECONDARY_COLOR,
            disabled: LIGHT_TEXT_DISABLED_COLOR
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
          ...commonMuiPalette,
          background: {
            default: DARK_BACKGROUND_LAYOUT_COLOR,
            paper: DARK_BACKGROUND_CONTAINER_COLOR
          },
          text: {
            primary: DARK_TEXT_PRIMARY_COLOR,
            secondary: DARK_TEXT_SECONDARY_COLOR,
            disabled: DARK_TEXT_DISABLED_COLOR
          }
        }
      }),
      antd: (base, theme) => ({
        ...base,
        algorithm: theme.darkAlgorithm,
        token: {
          ...base.token,
          colorBgLayout: DARK_BACKGROUND_LAYOUT_COLOR,
          colorBgContainer: DARK_BACKGROUND_CONTAINER_COLOR,
          colorText: DARK_TEXT_PRIMARY_COLOR,
          colorTextSecondary: DARK_TEXT_SECONDARY_COLOR,
          colorTextTertiary: DARK_TEXT_SECONDARY_COLOR,
          colorTextDisabled: DARK_TEXT_DISABLED_COLOR
        }
      })
    }
  }
};

// export const defaultThemesConfig = {
//   common: {
//     // Antd style
//     drawerMaterialThemeConfig: (theme) => {
//       const textColor = "rgba(255,255,255,0.65)";
//       const hoverTextColor = "rgba(255,255,255,0.95)";
//
//       return {
//         overrides: {
//           MuiListItemIcon: {
//             root: {
//               color: "inherit"
//             },
//           },
//           // Title for hover submenu
//           MuiTypography: {
//             body2: {
//               color: hoverTextColor,
//             }
//           },
//           MuiListItem: {
//             root: {
//               color: textColor,
//               "&:hover": {
//                 transition: theme.transitions.create("color"),
//                 color: hoverTextColor,
//               },
//               "&$selected": {
//                 color: hoverTextColor,
//               }
//             }
//           },
//           // TODO rewrite to v5
//           // MuiIconButton: {
//           //   label: {
//           //     color: textColor,
//           //     // "&:hover": {
//           //     //   transition: theme.transitions.create('color'),
//           //     //   color: hoverTextColor,
//           //     // }
//           //   }
//           // }
//         }
//       };
//     },
//   },
//   light: {
//     materialThemeConfig: {
//       overrides: {
//         MuiInput: {
//           input: {
//             "&:-webkit-autofill": {
//               WebkitBoxShadow: "0 0 0 1000px white inset" //Disable autofill
//             }
//           }
//         }
//       }
//     },
//     baseTableMaterialThemeConfig: {
//       palette: {
//         background: {
//           default: "#FFFFFF"
//         },
//         action: {
//           selected: "#0000FF" // For highlighted row
//         }
//       }
//     },
//     // Antd style
//     drawerMaterialThemeConfig: theme => ({
//       palette: {
//         background: {
//           paper: "#001529",
//           default: "#000c17",
//         },
//         action: {
//           selected: theme.palette.primary.main
//         }
//       },
//     }),
//   },
//   dark: {
//     materialThemeConfig: {
//       overrides: {
//         MuiInput: {
//           input: {
//             "&:-webkit-autofill": {
//               WebkitBoxShadow: "0 0 0 1000px #141414 inset", //Disable autofill
//               WebkitTextFillColor: "white"
//             }
//           }
//         }
//       }
//     },
//     drawerMaterialThemeConfig: {
//       palette: {
//         background: {
//           default: "#141414",
//           paper: "#1f1f1f"
//         }
//       }
//     }
//   }
// };
