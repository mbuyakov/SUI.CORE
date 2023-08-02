import {MuiIcons, IconButton, IconButtonProps} from "@sui/deps-material";
import React, {useContext} from "react";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {UpendRotator} from "@/Material";

export const DrawerVisibleButton: React.FC<Omit<IconButtonProps, "onClick"> & {
  forceDrawerOpen?: boolean;
  disableRotate?: boolean;
  icon?: React.JSX.Element;
}> = ({
        forceDrawerOpen,
        disableRotate,
        icon,
        ...props
      }) => {

  const {drawerOpen, setDrawerState} = useContext(BasicLayoutContext);

  return (
    <IconButton onClick={() => setDrawerState(!drawerOpen)} {...props} size="large">
      <UpendRotator rotate={!disableRotate && (drawerOpen || forceDrawerOpen)}>
        {icon || <MuiIcons.ChevronRight/>}
      </UpendRotator>
    </IconButton>
  );
};
