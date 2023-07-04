import {ChevronRight} from "@mui/icons-material";
import {IconButton} from "@sui/deps-material";
import React, {useContext} from "react";
import {IconButtonProps} from "@mui/material/IconButton";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {UpendRotator} from "@/Material";

export const DrawerVisibleButton: React.FC<Omit<IconButtonProps, "onClick"> & {
  forceDrawerOpen?: boolean;
  disableRotate?: boolean;
  icon?: JSX.Element;
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
        {icon || <ChevronRight/>}
      </UpendRotator>
    </IconButton>
  );
};
