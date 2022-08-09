import React, {useContext} from "react";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {Divider, SwipeableDrawer, Theme} from "@material-ui/core";
import clsx from "clsx";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {DrawerVisibleButton} from "@/layout/DrawerVisibleButton";
import {DrawerRoutes} from "@/layout/DrawerRoutes";

const useStyles = makeStyles<Theme, {
  drawerWidth: number;
}>((theme: Theme) =>
  createStyles({
    drawer: ({drawerWidth}) => ({
      width: drawerWidth,
      flexShrink: 0,
      borderRight: 0,
      whiteSpace: 'nowrap',
      transition: theme.transitions.create('width'),
      overflowX: 'hidden',
      left: "auto"
    }),
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Nested height
      ...theme.mixins.toolbar as any,
    },
    listWrapper: {
      flexShrink: 1,
      overflowX: 'hidden',
      overflowY: "auto",
    },
    listWrapperClose: {
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    listItemText: {
      "& span": {
        textOverflow: "ellipsis",
        overflowX: "hidden",
      },
    },
    divider: {
      height: 2,
      backgroundColor: theme.palette.background.paper
    },
    drawerVisibleButton: {
      borderRadius: 0,
      backgroundColor: theme.palette.background.default,
      "&:hover": {
        backgroundColor: theme.palette.background.default,
      }
    }
  })
);

export const Drawer: React.FC<{
  title(drawerOpen: boolean): React.ReactNode;
  isMobile: boolean;
}> = ({
        title,
        isMobile
      }) => {
  const {openDrawerWidth, drawerWidth, drawerOpen, setDrawerState} = useContext(BasicLayoutContext);

  const classes = useStyles({drawerWidth: isMobile ? openDrawerWidth : drawerWidth});

  return (
    <SwipeableDrawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      className={classes.drawer}
      classes={{
        paper: classes.drawer
      }}
      PaperProps={{
        elevation: 6
      }}
      onOpen={() => setDrawerState(true)}
      open={drawerOpen}
      onClose={() => setDrawerState(false)}
    >
      <div className={classes.toolbar}>
        {title(drawerOpen || isMobile)}
      </div>
      <div
        className={clsx(classes.listWrapper, {
          [classes.listWrapperClose]: !(drawerOpen || isMobile),
        })}
      >
        <DrawerRoutes/>
      </div>
      <div style={{flexGrow: 1}}/>
      <Divider className={classes.divider}/>
      <DrawerVisibleButton
        disableRipple={true}
        className={classes.drawerVisibleButton}
        forceDrawerOpen={isMobile}
      />
    </SwipeableDrawer>
  );
}
