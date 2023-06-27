import React, {useMemo, useState} from "react";
import {Collapse, CollapseProps, List, ListItem, ListItemProps, MenuProps, Typography} from "@mui/material";
import { Theme } from "@mui/material/styles";
// import createStyles from '@mui/styles/createStyles';
// import makeStyles from '@mui/styles/makeStyles';
import {ExpandMore} from "@mui/icons-material";
import clsx from "clsx";
import {bindHover, bindMenu, usePopupState} from "material-ui-popup-state/hooks";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import {v4 as uuidv4} from 'uuid';
import {UpendRotator} from "@/Material";

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     nested: {
//       paddingLeft: theme.spacing(4),
//     },
//     menuPaper: {
//       left: `${theme.spacing(7)} !important`
//     },
//     title: {
//       width: "100%",
//       textAlign: "center",
//       paddingBottom: theme.spacing(1)
//     }
//   }),
// );

export const DrawerListSubmenu: React.FC<ListItemProps<'div'> & {
  active: boolean;
  hoverMode: boolean;
  items: JSX.Element[];
  CollapseProps?: Omit<CollapseProps, 'in' | 'timeout' | 'children'>;
  MenuProps?: Omit<MenuProps, 'children' | 'open'>;
}> = ({
        active,
        hoverMode,
        items,
        title,
        CollapseProps,
        MenuProps,
        children,
        ...rest
      }) => {
  // const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const popupState = usePopupState({
    variant: 'popover',
    popupId: useMemo(() => uuidv4(), [])
  });

  let listItem = (
    <ListItem
      {...rest}
      button={true}
      selected={active && hoverMode}
    >
      {children}
      <UpendRotator rotate={active || isOpen}>
        <ExpandMore/>
      </UpendRotator>
    </ListItem>
  );

  listItem = React.cloneElement(
    listItem,
    hoverMode
      ? bindHover(popupState)
      // To prevent interact with active group
      : {onClick: () => !active && setOpen(!isOpen)}
  );

  return (
    <>
      {listItem}
      {/* Standard mode */}
      <Collapse
        in={isOpen || (active && !hoverMode)}
        timeout="auto"
        {...CollapseProps}
      >
        <List
          component="div"
          disablePadding={true}
        >
          {React.Children.map(items, it => React.cloneElement(it, {className: clsx(it.props.className/*, classes.nested*/)}))}
        </List>
      </Collapse>
      {/* Hover mode */}
      <HoverMenu
        {...MenuProps}
        PaperProps={{
          // className: clsx(MenuProps?.PaperProps?.className, classes.menuPaper)
        }}
        {...bindMenu(popupState)}
      >
        <Typography variant="body2" /*className={classes.title}*/>{title}</Typography>
        {items}
      </HoverMenu>
    </>
  );
}