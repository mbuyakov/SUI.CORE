import {defaultIfNotBoolean} from "@sui/ui-old-core";
import {Menu} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import * as React from "react";

// noinspection ES6PreferShortImport
import {DnDList} from "../Draggable";
// noinspection ES6PreferShortImport
import {MetaCardConfigurator} from "../Meta";
// noinspection ES6PreferShortImport
import {Rendered} from "../other";

import {RowSettings} from "./RowSettings";

export class RowsList extends React.Component<{
  id: string
  initialItems: Array<Rendered<RowSettings>>
  listRef: React.RefObject<DnDList<RowSettings>>
  style?: React.CSSProperties
  titleEnabled?: boolean
  onDelete?(): void
}> {
  public render(): React.JSX.Element {
    const titleEnabled = defaultIfNotBoolean(this.props.titleEnabled, true);

    return (
      <DnDList<RowSettings>
        id={`${this.props.id}-rows`}
        ref={this.props.listRef}
        type="RowSettings"
        title={titleEnabled && "Содержимое"}
        onDelete={this.props.onDelete}
        deletableChildren={true}
        initialItems={this.props.initialItems}
        style={this.props.style}
        addButtons={[
          (<Menu.Item
            onClick={this.onRowAddClicked}
          >
            Строку
          </Menu.Item>),
          (<Menu.Item
            onClick={this.onDividerAddClicked}
          >
            Разделитель
          </Menu.Item>),
          (<Menu.Item
            onClick={this.onTabsAddClicked}
          >
            Вкладки
          </Menu.Item>),
          (<Menu.Item
            onClick={this.onCollapseAddClicked}
          >
            Коллапс панели
          </Menu.Item>),
          (<Menu.Item
            onClick={this.onTableAddClicked}
          >
            Таблицу
          </Menu.Item>),
          ...Array.from(MetaCardConfigurator.plugins.values()).map(plugin => (
            <Menu.Item
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(): void => this.props.listRef.current.addItem(React.cloneElement(plugin.getNewSettingsInstance(false), {__type: plugin.id}) as unknown as any)}
            >
              {plugin.addText}
            </Menu.Item>
          ))
        ]}
      />
    );
  }

  @autobind
  private onCollapseAddClicked(): void {
    this.props.listRef.current.addItem(<RowSettings startType="collapse"/>);
  }

  @autobind
  private onDividerAddClicked(): void {
    this.props.listRef.current.addItem(<RowSettings startType="divider"/>);
  }

  @autobind
  private onRowAddClicked(): void {
    this.props.listRef.current.addItem(<RowSettings startType="row"/>);
  }

  @autobind
  private onTableAddClicked(): void {
    this.props.listRef.current.addItem(<RowSettings startType="metatable"/>);
  }

  @autobind
  private onTabsAddClicked(): void {
    this.props.listRef.current.addItem(<RowSettings startType="tabs"/>);
  }
}
