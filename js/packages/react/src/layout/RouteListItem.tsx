import React, {useContext} from "react";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {ListItem, ListItemIcon, ListItemProps, ListItemText, Theme, Tooltip} from "@material-ui/core";
import {useHistory, useLocation} from "react-router-dom";
import {matchPath as matchPathRR} from "react-router";
import {Location} from "history"
import {getSUISettings, IRawRoute} from "@sui/core";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {DrawerListSubmenu} from "@/layout/DrawerListSubmenu";
import {checkAuthority} from "@/access";
import {RouterLink} from "@/Link";

function matchPath(location: Location<unknown>, path: string): boolean {
  return !!matchPathRR(location.pathname, {
    path,
    exact: false,
    strict: false,
  })
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItemIcon: {
      minWidth: theme.spacing(5),
      "& span": {
        marginLeft: theme.spacing(1) / 2,
        marginRight: "0 !important",
      },
    },
    listItemText: {
      "& span": {
        textOverflow: "ellipsis",
        overflowX: "hidden",
      },
    },
    listSubmenu: {
      backgroundColor: theme.palette.background.default
    }
  }),
);

function shouldShowRouteListItem(route: IRawRoute, customListItemContent?: React.ReactNode): boolean {
  if (!route.name && !customListItemContent) {
    return false;
  }

  const authority = route.authority;
  if (authority) {
    // For old projects
    // @ts-ignore
    if (authority.length) {
      // eslint-disable-next-line no-alert
      alert('You routes has authority as array. Please switch to or-and construction');
      return null;
    }

    try {
      if (!checkAuthority(authority)) {
        return false;
      }
    } catch (e) {
      console.error('Can\'t get state: ', e);
      return false;
    }
  }

  return true;
}

export const RouteListItem: React.FC<ListItemProps<'div'> & {
  route: IRawRoute;
  isSubItem: boolean;
  customListItemContent?: React.ReactNode;
  base?: string;
}> = ({
        route,
        isSubItem,
        customListItemContent,
        base = 'app.route',
        ...rest
      }) => {
  // Fast-fail path
  if (!shouldShowRouteListItem(route, customListItemContent)) {
    return null;
  }

  // Hooks
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const {drawerOpen} = useContext(BasicLayoutContext);

  const newBase = `${base}.${route.name}`;
  const title = getSUISettings().layout.formatMessage({id: newBase});
  let listItem: JSX.Element;

  // Icon + title
  const listItemContent = customListItemContent ?? (
    <>
      {route.icon && (
        <ListItemIcon className={classes.listItemIcon}>
          {getSUISettings().layout.getIcon(route.icon)}
        </ListItemIcon>
      )}
      <ListItemText
        className={classes.listItemText}
        primary={title}
      />
    </>
  );

  const hasSubItems = route.routes && !route.tabs && !route.group;
  if (hasSubItems) {
    const childs = route.routes
      .filter(it => shouldShowRouteListItem(it))
      .map(it => (
        <RouteListItem
          isSubItem={true}
          route={it}
          base={newBase}
        />
      ));

    // No any subroutes available
    if (!childs.length) {
      return null;
    }

    const hasActiveSubPaths = route.routes.some(it => matchPath(location, it.path));

    listItem = (
      <DrawerListSubmenu
        hoverMode={!drawerOpen}
        active={hasActiveSubPaths}
        title={title}
        items={childs}
        CollapseProps={{className: classes.listSubmenu}}
        key={route.path}
      >
        {listItemContent}
      </DrawerListSubmenu>
    );
  } else {
    listItem = (
      <ListItem
        {...rest}
        selected={matchPath(location, route.path)}
        button={true}
        key={route.path}
      >
        {listItemContent}
      </ListItem>
    );
  }

  // And add tooltip <3
  if (
    (!drawerOpen && !isSubItem) // Drawer closed, item in main menu
    || (drawerOpen && (route.icon && title.length >= 21 || title.length >= 22)) // Drawer open, item in main menu
    // Items in hover submenu (when drawer closed) has autowidth
  ) {
    listItem = (
      <Tooltip title={title} placement="right" arrow={true}>
        {listItem}
      </Tooltip>
    );
  }

  if (!hasSubItems) {
    listItem = (
      <RouterLink to={route.pathFn ? route.pathFn : route.path}>
        {listItem}
      </RouterLink>
    );
  }

  return listItem;
}
