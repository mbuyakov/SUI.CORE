import autobind from "autobind-decorator";
import * as React from "react";

import {BaseForm, IBaseFormProps} from "../Base";
import {ObservableBinder} from "../Observable";
import {sleep} from "../other";

import {defaultModalFooter, IPromisedModalProps, PromisedModal} from "./PromisedModal";

export type IPromisedBaseFormModalOnlyModalProps = Omit<IPromisedModalProps, "ref" | "customFooter" | "promise">;

export interface IPromisedBaseFormModalProps<TValues> extends IPromisedBaseFormModalOnlyModalProps {
  baseFormProps: Omit<IBaseFormProps, "children" | "onSubmit" | "ref">;
  modalHeader?: React.ReactNode;
  onSubmit?(values: TValues): Promise<boolean>;
}

export class PromisedBaseFormModal<T extends {}> extends React.Component<IPromisedBaseFormModalProps<T>> {

  public readonly formRef: React.RefObject<BaseForm> = React.createRef();
  public readonly modalRef: React.RefObject<PromisedModal> = React.createRef();

  public render(): JSX.Element {
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    const hasErrors = this.formRef.current && this.formRef.current.hasErrors;

    return (
      <PromisedModal
        {...this.props}
        ref={this.modalRef}
        promise={this.modalPromise}
        // tslint:disable-next-line:jsx-no-lambda
        customFooter={(okButton, cancelButton): JSX.Element => defaultModalFooter(
          hasErrors
            ? (
              <ObservableBinder observable={hasErrors}>
                {hasErrorsValue => React.cloneElement(okButton, {disabled: hasErrorsValue || okButton.props.disabled})}
              </ObservableBinder>
            ) : okButton,
          cancelButton
        )}
        onOpen={this.onOpen}
      >
        {this.props.modalHeader}
        <BaseForm
          ref={this.formRef}
          noCard={true}
          verticalLabel={true}
          {...this.props.baseFormProps}
          onSubmit={this.props.onSubmit}
        />
      </PromisedModal>
    );
  }

  @autobind
  private async modalPromise(): Promise<boolean> {
    if (this.props.onSubmit && this.formRef.current) {
      return this.formRef.current.onSubmit();
    }

    return true;
  }

  @autobind
  private async onOpen(): Promise<void> {
    while (!this.formRef.current) {
      await sleep(100);
    }

    this.forceUpdate();

    if (this.props.onOpen) {
      await this.props.onOpen();
    }
  }

}
