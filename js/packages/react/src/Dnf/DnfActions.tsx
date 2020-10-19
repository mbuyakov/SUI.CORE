/* tslint:disable:member-ordering */
import {ArrowDownOutlined, ArrowUpOutlined, MinusCircleOutlined} from '@ant-design/icons';
import {Button} from "antd";
import {ButtonGroupProps} from "antd/lib/button";
import {ButtonHTMLType, ButtonProps} from "antd/lib/button/button";
import {SizeType} from "antd/lib/config-provider/SizeContext";
import React from "react";

const defaultCommonButtonProps = {
  htmlType: "button" as ButtonHTMLType,
  size: "small" as SizeType
};

export type IDnfActionsButtonProps = Omit<ButtonProps, "onClick">;

export interface IDnfActionsProps {
  buttonGroupProps?: ButtonGroupProps;
  upButtonProps?: IDnfActionsButtonProps;
  removeButtonProps?: IDnfActionsButtonProps;
  downButtonProps?: IDnfActionsButtonProps;
  onUp?(): void;
  onRemove?(): void;
  onDown?(): void;
}

export class DnfActions extends React.Component<IDnfActionsProps> {

  public render(): JSX.Element {
    return (
      <Button.Group {...this.props.buttonGroupProps}>
        <Button
          {...defaultCommonButtonProps}
          icon={<ArrowUpOutlined/>}
          {...this.props.upButtonProps}
          onClick={this.props.onUp}
        />
        <Button
          {...defaultCommonButtonProps}
          icon={<MinusCircleOutlined/>}
          {...this.props.removeButtonProps}
          onClick={this.props.onRemove}
        />
        <Button
          {...defaultCommonButtonProps}
          icon={<ArrowDownOutlined/>}
          {...this.props.downButtonProps}
          onClick={this.props.onDown}
        />
      </Button.Group>
    );
  }

}
