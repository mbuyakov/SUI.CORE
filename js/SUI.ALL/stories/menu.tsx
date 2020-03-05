/* tslint:disable:no-default-export */

import { Menu } from 'antd';
import * as React from 'react';

// tslint:disable-next-line:no-import-side-effect
import '../styles/index.less';


export default class LeftMenu extends React.Component<{}> {
  public render(): JSX.Element {
    return (
      <>
        <style>
          {`
            .SUI_LEFT_MENU {
              height: 100%;
            }
            .SUI_LEFT_MENU .ant-menu:not(.ant-menu-inline) .ant-menu-submenu-open {
              color: #FFF;
            }
            .SUI_LEFT_MENU .ant-menu {
              background: transparent;
              background-image: linear-gradient(#202020, #515151);
              height: 100%;
              width: 256px;
            }
            .SUI_LEFT_MENU_SUB .ant-sub-menu {
              background: #202020;
            }
            .SUI_LEFT_MENU .ant-menu.ant-menu-dark .ant-menu-item-selected {
              background-color: #FCF69B;
              color: #000 !important;
            }
            .SUI_LEFT_MENU_SUB .ant-menu.ant-menu-dark .ant-menu-item-selected {
              background-color: #FCF69B;
              color: #000 !important;
            }
            .SUI_LEFT_MENU .ant-menu-dark .ant-menu-inline.ant-menu-sub {
              background: #000;
            }
          `}
        </style>
      <div className="SUI_LEFT_MENU" style={{display: 'flex'}}>
        <Menu
          theme="dark"
          defaultSelectedKeys={['3']}
          defaultOpenKeys={['1']}
          style={{marginRight: 300}}
        >
          <Menu.SubMenu key="1" title="Выпадашка" popupClassName="SUI_LEFT_MENU_SUB">
            <Menu.Item>Пунктик</Menu.Item>
            <Menu.Item>Пунктик</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key='2' title='Выпадашка' popupClassName="SUI_LEFT_MENU_SUB">
            <Menu.Item>Пунктик</Menu.Item>
            <Menu.Item>Пунктик</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="3">Пунктик</Menu.Item>
          <Menu.Item key="4">Пунктик</Menu.Item>
        </Menu>
        <div style={{flexGrow: 1}} />
        <Menu
          theme="dark"
          defaultSelectedKeys={['3']}
          defaultOpenKeys={['1']}
          mode="inline"
        >
          <Menu.SubMenu key="1" title="Выпадашка" popupClassName="SUI_LEFT_MENU_SUB">
            <Menu.Item>Пунктик</Menu.Item>
            <Menu.Item>Пунктик</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key='2' title='Выпадашка' popupClassName="SUI_LEFT_MENU_SUB">
            <Menu.Item>Пунктик</Menu.Item>
            <Menu.Item>Пунктик</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="3">Пунктик</Menu.Item>
          <Menu.Item key="4">Пунктик</Menu.Item>
        </Menu>
      </div>
      </>
    );
  }
};
