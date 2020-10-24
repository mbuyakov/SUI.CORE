import {ThemesConfig} from "@/themes/types";

export const defaultTheme: ThemesConfig = {
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
    }
  },
  light: {
    materialThemeConfig: {
      palette: {
        type: "light"
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
