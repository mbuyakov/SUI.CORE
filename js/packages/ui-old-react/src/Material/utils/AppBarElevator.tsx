import {useScrollTrigger} from "@sui/deps-material";
import React from "react";

export const AppBarElevator: React.FC<{
  target?: Node | Window
  children: React.JSX.Element
}> = ({
        target,
        children
      }) => {
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target
  });

  return React.cloneElement(children, {elevation: scrollTrigger ? 12 : 6});
};
