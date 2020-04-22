import {Chip} from "@material-ui/core";
import Input from 'antd/lib/input';
import autobind from "autobind-decorator";
import * as React from "react";

import {DnDDragHandler, IBaseDnDChildProps} from "../Draggable";
import {ISerializable, SerializableDnDChild} from "../Draggable/Serializable";

interface IFreeTextState {
  text: string
}

export type SerializedFreeText = ISerializable<IFreeTextState>;

interface IFreeTextProps extends IBaseDnDChildProps {
  plain?: SerializedFreeText
}

const LAST_FREE_TEXT_VERSION = -1;

export class FreeText extends SerializableDnDChild<SerializedFreeText> {

  public constructor(props: IFreeTextProps) {
    super(props);

    if(this.isNew) {
      this.state = {
        ...this.state,
        text: "",
      };
    }
  }

  public getCurrentVersion(): number {
    return LAST_FREE_TEXT_VERSION;
  }

  public render(): JSX.Element {
    return (
      <Chip
        onDelete={this.props.onDelete}
        label={
          <>
            <DnDDragHandler/>
            <Input
              size="small"
              style={{minWidth: 100}}
              value={this.state.text}
              onChange={this.onTextChange}
            />
          </>
        }
      />
    );
  }

  @autobind
  public toPlainObject(): SerializedFreeText {
    return this.state;
  }

  @autobind
  private onTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({text: e.target.value})
  }

}
