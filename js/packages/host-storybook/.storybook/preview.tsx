import React from "react";
import {DecoratorFn} from "@storybook/react";
import {ModuleManagerRoot} from "@sui/ui-module-manager";
import {UiNotificationHandlerModule} from "@sui/ui-notification-handler";
import {LibNotificationDispatcherModule} from "@sui/lib-notification-dispatcher";
import {KludgeForStorybook, UiThemesModule} from "@sui/ui-themes";
import {LocalStorageModule} from "@sui/lib-storage";
import {HashRouter} from "@sui/deps-router";

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
      settings={async (mm) => {
        mm.addModule(new LibNotificationDispatcherModule());
        mm.addModule(new UiNotificationHandlerModule());
        mm.addModule(new LocalStorageModule());
        mm.addModule(new UiThemesModule({}));
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
