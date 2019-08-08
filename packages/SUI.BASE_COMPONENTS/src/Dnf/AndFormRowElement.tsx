import {Button} from "antd";
import * as React from "react";

export const formItemLayoutWithOutLabel = {
  style: {marginBottom: 0},
  wrapperCol: {
    sm: {span: 24, offset: 0},
    xs: {span: 24, offset: 0},
  }
};

export type ButtonAlignment = "start" | "center";

interface IAndFormRowElementProps {
  addButtons?: boolean;
  buttonAlignment?: ButtonAlignment;
  disableRowSwap?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  rowComponent: JSX.Element | React.ReactNode;

  onDeleteClick?(): void;
  onDownClick?(): void;
  onUpClick?(): void;
}

export class AndFormRowElement extends React.Component<IAndFormRowElementProps> {

  public render(): JSX.Element {
    return (
      <div style={{display: "flex", alignItems: this.props.buttonAlignment || "center"}}>
        <div style={{flexGrow: 1}}>
          {this.props.rowComponent}
        </div>
        {this.props.addButtons && (
          <Button.Group style={{paddingLeft: 4, paddingTop: 4, display: "flex"}}>
            {!this.props.disableRowSwap && (
              <Button
                htmlType="button"
                icon="arrow-up"
                disabled={this.props.isFirst}
                onClick={this.props.onUpClick}
              />
            )}
            <Button
              htmlType="button"
              icon="minus-circle-o"
              onClick={this.props.onDeleteClick}
            />
            {!this.props.disableRowSwap && (
              <Button
                htmlType="button"
                icon="arrow-down"
                disabled={this.props.isLast}
                onClick={this.props.onDownClick}
              />
            )}
          </Button.Group>
        )}
      </div>
    );
  }

}
