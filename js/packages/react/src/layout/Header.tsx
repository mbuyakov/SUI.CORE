import React, {useContext} from "react";
import {AppBar, Theme, Toolbar} from "@material-ui/core";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import MenuIcon from '@material-ui/icons/Menu';
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {DrawerVisibleButton} from "@/layout/DrawerVisibleButton";
import {AppBarElevator} from "@/Material";

const useStyles = makeStyles<Theme, {
  drawerWidth: number;
  isMobile: boolean;
}>((theme: Theme) =>
  createStyles({
    appBar: ({drawerWidth, isMobile}) => ({
      clipPath: "inset(-50px -50px -50px 0px)", // Disable shadow on left
      backgroundColor: theme.palette.background.paper,
      transition: theme.transitions.create(['width', 'margin', 'box-shadow']),
      marginLeft: isMobile ? 0 : drawerWidth,
      width: `calc(${document.documentElement.style.width || '100%'} - ${isMobile ? 0 : drawerWidth}px)`,
      right: "auto"
    })
  })
);

export const Header: React.FC<{
  isMobile: boolean;
}> = ({
        isMobile,
        children
      }) => {

  const {drawerWidth} = useContext(BasicLayoutContext);
  const styles = useStyles({drawerWidth, isMobile});

  return (
    <AppBarElevator>
      <AppBar
        position="fixed"
        className={styles.appBar}
      >
        <Toolbar>
          <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MenuIcon/>}
          />
          {children}
        </Toolbar>
      </AppBar>
    </AppBarElevator>
  );
}
