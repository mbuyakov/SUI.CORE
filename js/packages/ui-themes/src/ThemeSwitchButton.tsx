import {IconButton, MuiIcons} from "@sui/deps-material";
import React, {useState} from "react";
import {useHandler, useService} from "@sui/lib-hooks";
import {ThemeService} from "./ThemeService";
import {ThemeChangedEvent} from "./ThemeChangedEvent";



export const ThemeSwitchButton: React.FC = () => {
  const themeService = useService(ThemeService);
  const [theme, setTheme] = useState(themeService.getCurrentTheme());
  useHandler(themeService.addHandler(ThemeChangedEvent, event => {
    setTheme(event.theme);
  }), []);

  if (themeService.isNoDark()) {
    return null;
  }

  return (
    <IconButton
      size="large"
      onClick={() => themeService.setCurrentTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (<MuiIcons.Brightness7/>) : (<MuiIcons.Brightness4/>)}
    </IconButton>
  );
};
