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

const FAKE_PROMISE = (): Promise<void> => new Promise((resolve): void => resolve());

export class PromisedBaseFormModal<T extends {}> extends React.Component<IPromisedBaseFormModalProps<T>> {

  public formRef: React.RefObject<BaseForm> = React.createRef();
  public modalRef: React.RefObject<PromisedModal> = React.createRef();

  public render(): JSX.Element {
    // @ts-ignore
    const hasErrors = this.formRef.current && this.formRef.current.hasErrors;

    return (
      <PromisedModal
        {...this.props}
        ref={this.modalRef}
        promise={this.modalPromise}
        destroyOnClose={true}
        customFooter={(okButton, cancelButton): JSX.Element => defaultModalFooter(
          hasErrors
            ? (
              <ObservableBinder observable={hasErrors}>
                {hasErrorsValue => React.cloneElement(okButton, {disabled: hasErrorsValue || okButton.props.disabled})}
              </ObservableBinder>
            ) : okButton,
          cancelButton
        )}
        onCancel={this.onCancel}
        onOpen={this.onOpen}
      >
        {this.props.modalHeader}
        <BaseForm
          ref={this.formRef}
          noCard={true}
          verticalLabel={true}
          {...this.props.baseFormProps}
          onInitialized={this.onInitialized}
          onSubmit={(values) =>
            this.props.onSubmit(values).then(result => {
              this.result = result;
              return false;
            })
          }
        />
      </PromisedModal>
    );
  }

  private result: boolean;

  @autobind
  private async modalPromise(): Promise<boolean> {
    if (this.props.onSubmit && this.formRef.current) {
      return this.formRef.current.onSubmit().then(() => this.result);
    }

    return true;
  }

  @autobind
  private onCancel(event: React.MouseEvent<HTMLElement>): void {
    this.formRef = React.createRef();

    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  @autobind
  private onInitialized(form: BaseForm): void {
    if (this.props.baseFormProps?.onInitialized) {
      // @ts-ignore
      this.props.baseFormProps.onInitialized(form);
    }

    // hasErrors rerender
    this.forceUpdate();
  }

  @autobind
  private onOpen(): Promise<void> {
    const onOpen = this.props.onOpen ?? FAKE_PROMISE;

    return onOpen().then((): void => this.forceUpdate())
  }

}
