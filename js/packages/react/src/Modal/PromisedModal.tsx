import {Button, Modal} from "antd";
import {ModalProps} from "antd/lib/modal";
import autobind from "autobind-decorator";
import React from "react";

import {PromisedButton} from "../Inputs";
import {ExtractProps} from "../other";

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

export interface IPromisedModalProps extends Omit<ModalProps, "visible" | "onOk" | "footer" | "okButtonProps"> {
  defaultVisible?: boolean;
  okButtonProps?: Omit<ExtractProps<PromisedButton>, "promise" | "children">,
  customFooter?(okButton: JSX.Element, cancelButton: JSX.Element): React.ReactNode;
  onOpen?(): Promise<void>;
  promise?(): Promise<boolean>;
}

export interface IPromisedModalState {
  visible: boolean;
}

export class PromisedModal
  extends React.Component<IPromisedModalProps, IPromisedModalState> {

  public constructor(props: IPromisedModalProps) {
    super(props);
    this.state = {visible: !!props.defaultVisible};
  }

  public async componentDidMount(): Promise<void> {
    if (this.state.visible && this.props.onOpen) {
      await this.props.onOpen();
    }
  }

  public render(): JSX.Element {
    const onCancel = this.onModalClose;
    const okButtonProps = this.props.okButtonProps || {};

    const okButton = (
      <PromisedButton
        type="primary"
        {...okButtonProps}
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
    this.setState({visible}, async (): Promise<void> => {
      if (callback) {
        callback();
      }

      if (this.props.onOpen) {
        await this.props.onOpen();
      }
    });
  }

  @autobind
  private onModalClose(e: React.MouseEvent<HTMLElement>): void {
    this.setModalVisibility(false);
    if(this.props.onCancel) {
      this.props.onCancel(e);
    }
  }

}
