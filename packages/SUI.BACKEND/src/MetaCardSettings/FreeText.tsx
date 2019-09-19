import {Chip} from "@material-ui/core";
import Input from 'antd/lib/input';
import autobind from "autobind-decorator";
import * as React from "react";

import {IBaseDnDChildProps} from "../Draggable/DnDChild";
import {DnDDragHandler} from "../Draggable/DnDDragHandler";
import {ISerializable} from "../Draggable/Serializable/ISerializable";
import {SerializableDnDChild} from "../Draggable/Serializable/SerializableDnDChild";

interface IFreeTextState {
  text: string
}

export type SerializedFreeText = ISerializable<IFreeTextState>;

interface IFreeTextProps extends IBaseDnDChildProps {
  plain?: SerializedFreeText
}

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

  // tslint:disable-next-line:prefer-function-over-method
  public getCurrentVersion(): number {
    return -1;
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
