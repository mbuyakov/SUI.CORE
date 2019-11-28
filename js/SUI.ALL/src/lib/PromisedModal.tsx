import {Button, Modal} from "antd";
import {ModalProps} from "antd/lib/modal";
import autobind from "autobind-decorator";
import React from "react";

import {PromisedButton} from "./Inputs";

export const defaultModalFooter = (okButton: JSX.Element, cancelButton: JSX.Element) => (
  <div
    style={{
      display: "grid",
      gap: 8,
      gridTemplateColumns: "repeat(2, max-content)",
      justifyContent: "right"
    }}
  >
    {cancelButton}
    {okButton}
  </div>
);

export interface IPromisedModalProps extends Omit<ModalProps, "visible" | "onOk" | "footer"> {
  customFooter?(okButton: JSX.Element, cancelButton: JSX.Element): React.ReactNode;
  promise?(): Promise<boolean>;
}

export interface IPromisedModalState {
  visible: boolean;
}

export class PromisedModal
  extends React.Component<IPromisedModalProps, IPromisedModalState> {

  public constructor(props: IPromisedModalProps) {
    super(props);
    this.state = {visible: false};
  }

  public render(): JSX.Element {
    const onCancel = this.onModalClose;
    const okButtonProps = this.props.okButtonProps || {};

    const okButton = (
      <PromisedButton
        type="primary"
        {...okButtonProps}
        // tslint:disable-next-line:jsx-no-lambda
        promise={async (): Promise<void> => {
          if (this.props.promise) {
            const result = await this.props.promise();

            if (!result) {
              return; // Else don't refresh table and don't close modal
            }
          }

          this.setModalVisibility(false);
        }}
      >
        {this.props.okText || "Создать"}
      </PromisedButton>
    );

    const cancelButton = (
      <Button
        {...this.props.cancelButtonProps}
        onClick={onCancel}
      >
        {this.props.cancelText || "Отмена"}
      </Button>
    );

    return (
      <Modal
        visible={this.state.visible}
        destroyOnClose={true}
        centered={true}
        {...this.props}
        bodyStyle={{
          paddingBottom: 0,
          ...(this.props ? this.props.bodyStyle : undefined)
        }}
        footer={this.props.customFooter
          ? this.props.customFooter(okButton, cancelButton)
          : defaultModalFooter(okButton, cancelButton)
        }
        onCancel={onCancel}
      />
    );
  }

  @autobind
  public setModalVisibility(visible: boolean = true, callback?: () => void): void {
    this.setState({visible}, callback);
  }

  @autobind
  private onModalClose(): void {
    this.setModalVisibility(false);
  }

}
