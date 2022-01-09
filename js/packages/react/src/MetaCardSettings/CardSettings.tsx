import {Menu} from "antd";
import autobind from "autobind-decorator";
import * as React from "react";

// noinspection ES6PreferShortImport
import {DnDList} from "../Draggable";
// noinspection ES6PreferShortImport
import {ISerializable, ISerializableComponent} from "../Draggable/Serializable";
// noinspection ES6PreferShortImport
import {MetaCardConfigurator} from "../Meta";

import {FreeText, SerializedFreeText} from "./FreeText";
import {ItemSettings, SerializedItemSettings} from "./ItemSettings";
import {RowSettings, SerializedRowSettings} from "./RowSettings";
import {RowsList} from "./RowsList";

export type SerializedCardSettings = ISerializable<{
  rows: SerializedRowSettings[],
  title: Array<SerializedItemSettings | SerializedFreeText>
}>;

interface ICardSettingsProps {
  id: string
  plain?: SerializedCardSettings
}

const LAST_CARD_SETTINGS_VERSION: number = -1;

export class CardSettings extends React.Component<ICardSettingsProps> implements ISerializableComponent<SerializedCardSettings> {

  private readonly rowsRef: React.RefObject<DnDList<RowSettings>> = React.createRef();
  private readonly titleListRef: React.RefObject<DnDList<ItemSettings | FreeText>> = React.createRef();

  public getCurrentVersion(): number {
    return LAST_CARD_SETTINGS_VERSION;
  }

  public render(): JSX.Element {
    return (
      <div>
        <DnDList<ItemSettings | FreeText>
          id={`${this.props.id}-title`}
          ref={this.titleListRef}
          type="ItemSettings"
          title="Заголовок"
          deletableChildren={true}
          style={{marginBottom: 12}}
          // shouldAcceptDrop={CardSettings.shouldAcceptDrop}
          initialItems={
            this.props.plain &&
            this.props.plain.title &&
            this.props.plain.title.map(title => {
              if (typeof (title as SerializedFreeText).text === "string") {
                return (
                  <FreeText
                    plain={title as SerializedFreeText}
                    id={title.id}
                  />
                );
              }

              return (
                <ItemSettings
                  plain={title as SerializedItemSettings}
                  id={title.id}
                />
              );
            })
          }
          addButtons={[
            (<Menu.Item
              onClick={this.onTextAddClicked}
            >
              Произвольный текст
            </Menu.Item>)
          ]}
        />
        <RowsList
          id={this.props.id}
          listRef={this.rowsRef}
          initialItems={
            this.props.plain &&
            this.props.plain.rows &&
            this.props.plain.rows.map(row => row.__type
              ? (React.cloneElement(MetaCardConfigurator.plugins.get(row.__type).getNewSettingsInstance(true), {plain: row, id: row.id}))
              : (
                <RowSettings
                  plain={row}
                  id={row.id}
                />
              ))
          }
        />
      </div>
    );
  }

  @autobind
  public toPlainObject(): SerializedCardSettings {
    return {
      id: this.props.id,
      rows: this.rowsRef.current.getChildRefs().map(ref => ref.toPlainObject()),
      title: this.titleListRef.current.getChildRefs().map(ref => ref.toPlainObject()),
      version: -1
    };
  }

  @autobind
  private onTextAddClicked(): void {
    this.titleListRef.current.addItem(<FreeText/>)
  }
}
