import autobind from "autobind-decorator";
import * as React from "react";

import {BaseForm, IBaseFormProps} from "../Base";
import {ObservableBinder} from "../Observable";

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

  public componentDidMount(): void {
    if (this.props.defaultVisible) {
      setTimeout(() => this.forceUpdate(), 500);
    }
  }

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
                {hasErrorsValue => {
                  console.log("hasErrorsValue", hasErrorsValue, okButton.props.disabled);

                  return React.cloneElement(okButton, {disabled: hasErrorsValue || okButton.props.disabled});
                }}
              </ObservableBinder>
            ) : okButton,
          cancelButton
        )}
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

}
