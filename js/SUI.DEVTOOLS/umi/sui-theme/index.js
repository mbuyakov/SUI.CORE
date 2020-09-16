Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.modifyDefaultConfig(config => {
    config.theme = {
      "layout-header-height": "48px",
      "card-padding-wider": "24px",
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
      "btn-font-size-sm": "14px", // as text
      "border-color-base": "rgba(217, 217, 217, 0.6)",
      "btn-shadow": "none",
      ...config.theme,
    };
    return config;
  });
};

