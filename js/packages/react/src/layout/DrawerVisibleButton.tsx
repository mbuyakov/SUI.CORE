import {ChevronRight} from "@material-ui/icons";
import {IconButton} from "@material-ui/core";
import React, {useContext} from "react";
import {IconButtonProps} from "@material-ui/core/IconButton";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {UpendRotator} from "@/Material";

export const DrawerVisibleButton: React.FC<Omit<IconButtonProps, 'onClick'> & {
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
    <IconButton
      onClick={() => setDrawerState(!drawerOpen)}
      {...props}
    >
      <UpendRotator rotate={!disableRotate && (drawerOpen || forceDrawerOpen)}>
        {icon || <ChevronRight/>}
      </UpendRotator>
    </IconButton>
  );
}
