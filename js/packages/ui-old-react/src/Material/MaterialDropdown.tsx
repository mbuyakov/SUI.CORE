import {ButtonProps, Divider, IconButtonProps, ListItemIcon, ListItemText, MenuItem, MenuItemProps, MenuProps, Tooltip} from "@sui/deps-material";
import React, {useMemo} from "react";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import {bindHover, bindMenu, usePopupState} from "material-ui-popup-state/hooks";
import {v4 as uuidv4} from "uuid";
import {MaterialIconButton} from "@/Material/MaterialIconButton";
import {MaterialButton} from "@/Material/MaterialButton";
import {IPopconfirmSettings, useOnClick, usePopconfirm} from "@/Material/utils";

export type DropdownItem = Omit<MenuItemProps, "onClick"> & {
  key: string;
  tooltip?: string;
  icon?: React.JSX.Element;
  text?: React.ReactNode;
  onClick?: () => void;
};

export type DividerItem = {
  isDivider: true;
};

export type IMaterialDropdownItem = DropdownItem | DividerItem;

const isDropdownItem = (it: IMaterialDropdownItem): it is DropdownItem => "key" in it;
const isDividerItem = (it: IMaterialDropdownItem): it is DividerItem => "isDivider" in it;

interface IMaterialDropdownPropsBase {
  loading?: boolean;
  tooltip?: string;
  items: IMaterialDropdownItem[];
  menuProps?: Omit<MenuProps, "open">;
  popconfirmSettings?: IPopconfirmSettings;
  onClick?: (key: string) => void | Promise<void>;
}

type IMaterialDropdownButtonProps = IMaterialDropdownPropsBase & {
  buttonProps: Omit<ButtonProps, "onClick">;
};

type IMaterialDropdownIconButtonProps = IMaterialDropdownPropsBase & {
  iconButtonProps: Omit<IconButtonProps, "onClick">;
};

export type IMaterialDropdownProps = IMaterialDropdownButtonProps | IMaterialDropdownIconButtonProps;

const isIMaterialDropdownButtonProps = (it: IMaterialDropdownProps): it is IMaterialDropdownButtonProps => "buttonProps" in it;
const isIMaterialDropdownIconButtonProps = (it: IMaterialDropdownProps): it is IMaterialDropdownIconButtonProps => "iconButtonProps" in it;

export const MaterialDropdown: React.FC<IMaterialDropdownProps> = props => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: useMemo(() => uuidv4(), [])
  });

  const popconfirm = usePopconfirm(props.popconfirmSettings);

  const {loading: onClickLoading, onClick} = useOnClick<{
    key: string,
    itemOnClick?:() => void | Promise<void>
  }>(async (arg) => {
    const itemOnClickRet = arg.itemOnClick?.();
    const propsOnClickRet = props.onClick?.(arg.key);
    if ((itemOnClickRet as Promise<void>)?.then || (propsOnClickRet as Promise<void>)?.then) {
      await Promise.all([itemOnClickRet, propsOnClickRet].filter(it => it));
    }
  }, {popconfirm, popupState});
  const loading = onClickLoading || props.loading;

  let button: React.JSX.Element = null;

  if (isIMaterialDropdownButtonProps(props)) {
    button = (
      <MaterialButton
        {...bindHover(popupState)}
        {...props.buttonProps}
        style={{textTransform: "none", ...props.buttonProps.style}}
        loading={loading}
        tooltip={props.tooltip}
      />
    );
  }

  if (isIMaterialDropdownIconButtonProps(props)) {
    button = (
      <MaterialIconButton
        {...bindHover(popupState)}
        {...props.iconButtonProps}
        loading={loading}
        tooltip={props.tooltip}
      />
    );
  }

  return popconfirm.wrapper(
    <>
      {button}
      <HoverMenu
        {...bindMenu(popupState)}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
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
                // eslint-disable-next-line
                {...rest as any}
                // eslint-disable-next-line
                onClick={() => onClick({key, itemOnClick})}
              >
                {icon && (<ListItemIcon children={React.cloneElement(icon, {fontSize: "small"})}/>)}
                {text && (<ListItemText children={text}/>)}
                {children}
              </MenuItem>
            );

            if (tooltip) {
              menuItem = (<Tooltip title={tooltip} placement="right"><div>{menuItem}</div></Tooltip>);
            }

            return menuItem;
          }
        })}
      </HoverMenu>
    </>
  );
};
