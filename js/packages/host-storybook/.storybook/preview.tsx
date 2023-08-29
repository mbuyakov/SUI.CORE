import React from "react";
import {DecoratorFn} from "@storybook/react";
import {ModuleManagerRoot} from "@sui/ui-module-manager";
import {KludgeForStorybook} from "@sui/ui-themes";
import {HashRouter} from "@sui/deps-router";
import {Color} from "@sui/lib-color";

const withRouter: DecoratorFn = (Story) => {
  return (
    <HashRouter>
      <Story />
    </HashRouter>
  );
};

const withModuleRoot: DecoratorFn = (Story) => {
  return (
    <ModuleManagerRoot
      projectKey="storybook"
      restUrl="restUrl"
      settings={{
        LibColorModule: {
          right: Color.fromHex("#fd625d"),
          center: Color.fromHex("#f2ca07"),
          left: Color.fromHex("#00baab")
        },
        UiThemesModule: {}
      }}
    >
      <Story />
    </ModuleManagerRoot>
  );
};


const withTheme: DecoratorFn = (Story, context) => (
  <KludgeForStorybook.Provider value={context.globals.theme}>
    <Story/>
  </KludgeForStorybook.Provider>
);
export const decorators = [withRouter, withModuleRoot, withTheme];

export const globalTypes = {
  theme: {
    defaultValue: "dark",
    toolbar: {
      icon: "paintbrush",
      dynamicTitle: true,
      items: [
        { value: "light", left: "☀️", title: "Light mode" },
        { value: "dark", left: "🌙", title: "Dark mode" },
      ],
    },
  },
};
