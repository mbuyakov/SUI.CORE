import {ButtonProps, Divider, IconButtonProps, ListItemIcon, ListItemText, MenuItem, MenuItemProps, MenuProps, Tooltip} from "@material-ui/core";
import React, {useCallback, useMemo, useState} from "react";
import HoverMenu from 'material-ui-popup-state/HoverMenu';
import {bindHover, bindMenu, usePopupState} from 'material-ui-popup-state/hooks';
import uuid from "uuid";
import {usePromise} from "@/hooks";
import {MaterialIconButton} from "@/Material/MaterialIconButton";
import {MaterialButton} from "@/Material/MaterialButton";

export type DropdownItem = Omit<MenuItemProps, 'onClick'> & {
  key: string;
  tooltip?: string;
  icon?: JSX.Element;
  text?: React.ReactNode;
  onClick?: () => void;
}

export type DividerItem = {
  isDivider: true;
}

export type IMaterialDropdownItem = DropdownItem | DividerItem;

const isDropdownItem = (it: IMaterialDropdownItem): it is DropdownItem => "key" in it;
const isDividerItem = (it: IMaterialDropdownItem): it is DividerItem => "isDivider" in it;

interface IMaterialDropdownPropsBase {
  loading?: boolean;
  tooltip?: string;
  items: IMaterialDropdownItem[];
  menuProps?: Omit<MenuProps, 'open'>;
  onClick?: (key: string) => void | Promise<void>
}

type IMaterialDropdownButtonProps = IMaterialDropdownPropsBase & {
  buttonProps: Omit<ButtonProps, 'onClick'>;
}

type IMaterialDropdownIconButtonProps = IMaterialDropdownPropsBase & {
  iconButtonProps: Omit<IconButtonProps, 'onClick'>;
}

export type IMaterialDropdownProps = IMaterialDropdownButtonProps | IMaterialDropdownIconButtonProps

const isIMaterialDropdownButtonProps = (it: IMaterialDropdownProps): it is IMaterialDropdownButtonProps => "buttonProps" in it;
const isIMaterialDropdownIconButtonProps = (it: IMaterialDropdownProps): it is IMaterialDropdownIconButtonProps => "iconButtonProps" in it;

export const MaterialDropdown: React.FC<IMaterialDropdownProps> = props => {
  const [promise, setPromise] = useState<Promise<void[]>>(null);
  const {loading} = usePromise(promise);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: useMemo(() => uuid.v4(), [])
  });

  const onClick = useCallback((key: string, itemOnClick?: () => void | Promise<void>) => {
    const itemOnClickRet = itemOnClick?.();
    const propsOnClickRet = props.onClick?.(key);
    popupState.close();

    if ((itemOnClickRet as Promise<void>)?.then || (propsOnClickRet as Promise<void>)?.then) {
      setPromise(Promise.all([itemOnClickRet, propsOnClickRet].filter(it => it)));
    }
  }, []);

  let button: JSX.Element = null;

  if (isIMaterialDropdownButtonProps(props)) {
    button = (
      <MaterialButton
        {...bindHover(popupState)}
        {...props.buttonProps}
        style={{textTransform: 'none', ...props.buttonProps.style}}
        loading={loading || props.loading}
        tooltip={props.tooltip}
      />
    );
  }

  if (isIMaterialDropdownIconButtonProps(props)) {
    button = (
      <MaterialIconButton
        {...bindHover(popupState)}
        {...props.iconButtonProps}
        loading={loading || props.loading}
        tooltip={props.tooltip}
      />
    );
  }

  return (
    <>
      {button}
      <HoverMenu
        {...bindMenu(popupState)}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        {...props.menuProps}
      >
        {props.items.map((it: DropdownItem) => {
          if (isDividerItem(it)) {
            return (
              <Divider style={{marginTop: 4, marginBottom: 4}}/>
            );
          }

          if (isDropdownItem(it)) {
            const {
              key,
              onClick: itemOnClick,
              icon,
              text,
              children,
              tooltip,
              ...rest
            } = it;
            let menuItem = (
              <MenuItem
                {...rest as any}
                onClick={() => onClick(key, itemOnClick)}
              >
                {icon && (<ListItemIcon children={React.cloneElement(icon, {fontSize: "small"})}/>)}
                {text && (<ListItemText children={text}/>)}
                {children}
              </MenuItem>
            );

            if (tooltip) {
              menuItem = (
                <Tooltip title={tooltip} placement="right">
                  {menuItem}
                </Tooltip>
              );
            }
            return menuItem;
          }
        })}
      </HoverMenu>
    </>
  );
}
