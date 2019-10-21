import {Button, Form} from "antd";
import {ButtonProps} from "antd/lib/button";
import {FormComponentProps, FormItemProps, FormProps} from "antd/lib/form";
import {WrappedFormUtils} from "antd/lib/form/Form";
import autobind from "autobind-decorator";
import * as React from "react";

const tailFormItemLayout = {
  style: {
    marginBottom: 12,
  },
  wrapperCol: {
    sm: {
      offset: 6,
      span: 18,
    },
    xs: {
      offset: 0,
      span: 24,
    },
  }
};

// tslint:disable-next-line:no-any
export function hasErrors(fieldsError: any): boolean {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export type CommonFormChildrenType = (form: WrappedFormUtils) => JSX.Element;

export interface ICommonFormProps<TValues = {}> {
  children: CommonFormChildrenType;
  formProps?: FormProps;
  resetOnSubmit?: boolean;
  submitButtonFormItemProps?: FormItemProps;
  submitButtonProps?: ButtonProps;
  validateOnMount?: boolean;
  withoutButton?: boolean;

  isDisabled?(values: TValues): boolean;

  onSubmit(values: TValues): Promise<void>;
}

class CommonFormImpl<TValues> extends React.Component<FormComponentProps & ICommonFormProps<TValues>, {
  loading?: boolean;
}> {

  public componentDidMount(): void {
    if (typeof (this.props.validateOnMount) === "boolean" ? this.props.validateOnMount : true) {
      this.props.form.validateFields();
    }
  }

  public render(): JSX.Element {
    return (
      <Form
        onSubmit={this.onSubmit}
        {...this.props.formProps}
      >
        {this.props.children(this.props.form)}
        {!this.props.withoutButton && (
          <Form.Item
            {...tailFormItemLayout}
            {...this.props.submitButtonFormItemProps}
          >
            <Button
              type="primary"
              children="Сохранить"
              {...this.props.submitButtonProps}
              htmlType="submit"
              loading={this.state && this.state.loading}
              disabled={
                hasErrors(this.props.form.getFieldsError())
                || (this.props.isDisabled && this.props.isDisabled(this.props.form.getFieldsValue() as TValues))
              }
            />
          </Form.Item>
        )}
      </Form>
    );
  }

  @autobind
  private onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    // tslint:disable-next-line:no-any
    this.props.form.validateFields((err: any, values: TValues) => {
      if (!err) {
        this.setState({loading: true});

        this.props.onSubmit(values)
          .finally(() => {
            this.setState({ loading: false });

            if (this.props.resetOnSubmit) {
              this.props.form.resetFields();
              this.props.form.validateFields();
            }
          })
          .catch(reason => console.error(reason));
      }
    });
  }

}

// tslint:disable-next-line:variable-name
const __CommonFormImpl = Form.create()(CommonFormImpl);

// tslint:disable-next-line:max-classes-per-file
export class CommonForm<TValues> extends React.Component<ICommonFormProps<TValues>> {

  public render(): JSX.Element {
    return (
      <__CommonFormImpl {...this.props}/>
    );
  }

}
