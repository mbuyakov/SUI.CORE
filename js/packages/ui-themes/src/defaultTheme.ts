import {AntdTheme, MuiTheme, SuiThemeConfig} from "./types";
import {createTheme as muiCreateTheme} from "@sui/deps-material";

const PRIMARY_COLOR = "#56CBF8";
const ERROR_COLOR = "#FF6565";
const SUCCESS_COLOR = "#A2E8AB";
export const muiDefaultTheme: MuiTheme = muiCreateTheme();

export const antdDefaultTheme: AntdTheme = {
  token: {},
  components: {}
};

export const suiDefaultTheme: SuiThemeConfig = {
  common: {
    base: {
      antd: (base, theme) => ({
        ...base,
        token: {
          ...base.token,
          colorPrimary: PRIMARY_COLOR,
          colorError: ERROR_COLOR,
          colorHighlight: ERROR_COLOR,
          colorSuccess: SUCCESS_COLOR
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

// export const defaultThemesConfig = {
//   common: {
//     lessVars: {
//       "layout-header-height": "48px",
//       "card-padding-wider": "24px",
//       "warning-color": "#FCF69B",
//       "border-radius-base": "8px",
//       "btn-border-radius-sm": "6px",
//       "btn-border-width": "2px",
//       "font-size-base": "15px",
//       "btn-font-size-sm": "14px",
//       "border-color-base": "rgba(217, 217, 217, 0.6)",
//       "btn-shadow": "none"
//     },
//     materialThemeConfig: theme => ({
//       zIndex: Object.keys(theme.zIndex).reduce((prev, cur) => {
//         prev[cur] = theme.zIndex[cur] - 900;
//         return prev;
//       }, {}),
//       palette: {
//         primary: {
//           main: "#56CBF8",
//           contrastText: "#FFFFFF"
//         }
//       },
//       overrides: {
//         MuiToolbar: {
//           gutters: {
//             [theme.breakpoints.up("sm")]: {
//               paddingLeft: theme.spacing(2), // 3 -> 2
//               paddingRight: theme.spacing(2)
//             }
//           }
//         },
//         MuiTooltip: {
//           tooltip: {
//             fontSize: "1em",
//           },
//         }
//       }
//     }),
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
//       palette: {
//         mode: "light",
//         background: {
//           default: "#f0f2f5" // Match antd
//         }
//       },
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
//       palette: {
//         mode: "dark",
//         background: {
//           default: "#000000", // Match antd
//           paper: "#141414"
//         }
//       },
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
