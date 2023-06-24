import {useScrollTrigger} from "@mui/material";
import React from "react";

export const AppBarElevator: React.FC<{
  target?: Node | Window
  children: JSX.Element
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
}
