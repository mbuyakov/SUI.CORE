import {MuiIcons, AppBar, Theme, Toolbar} from "@sui/deps-material";
import React, {useContext} from "react";
// import createStyles from '@mui/styles/createStyles';
// import makeStyles from '@mui/styles/makeStyles';
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {DrawerVisibleButton} from "@/layout/DrawerVisibleButton";
import {AppBarElevator} from "@/Material";

// const useStyles = makeStyles<Theme, {
//   drawerWidth: number;
//   isMobile: boolean;
// }>((theme: Theme) =>
//   createStyles({
//     appBar: ({drawerWidth, isMobile}) => ({
//       clipPath: "inset(-50px -50px -50px 0px)", // Disable shadow on left
//       backgroundColor: theme.palette.background.paper,
//       transition: theme.transitions.create(['width', 'margin', 'box-shadow']),
//       marginLeft: isMobile ? 0 : drawerWidth,
//       width: `calc(${document.documentElement.style.width || '100%'} - ${isMobile ? 0 : drawerWidth}px)`,
//       right: "auto"
//     })
//   })
// );

export const Header: React.FC<{
  isMobile: boolean;
  children: React.ReactNode;
}> = ({
        isMobile,
        children
      }) => {

  const {drawerWidth} = useContext(BasicLayoutContext);
  // const styles = useStyles({drawerWidth, isMobile});

  return (
    <AppBarElevator>
      <AppBar
        position="fixed"
        // className={styles.appBar}
      >
        <Toolbar>
          <DrawerVisibleButton
            edge="start"
            disableRotate={isMobile}
            icon={isMobile && <MuiIcons.Menu/>}
          />
          {children}
        </Toolbar>
      </AppBar>
    </AppBarElevator>
  );
};
