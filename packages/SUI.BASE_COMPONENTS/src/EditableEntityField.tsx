/* tslint:disable:jsx-no-lambda typedef no-any */
import { errorNotification, generateUpdate, IObjectWithIndex, NO_DATA_TEXT, Omit, PossibleId, PossibleValue } from '@smsoft/sui-core';
import { EditablePromisedComponent, IPromisedBaseProps, WaitData } from '@smsoft/sui-promised';
import { notification } from 'antd';
import { OptionProps } from 'antd/lib/select';
import * as React from 'react';

export class EditableEntityField<T = any> extends React.Component<{
  children: React.ReactElement<Omit<IPromisedBaseProps<T>, 'promise'>>
  customQuery?: string
  entity: string
  failMessage: string
  field: string
  id: PossibleId
  successMessage: string
  afterSave?(): Promise<void>
  customDefaultValue?(value: T): any
  nonEditRender?(value: T): React.ReactNode
  selectValueGenerator?(data: any): Array<React.ReactElement<OptionProps>>
  valuePreSaveConverter?(value: T): PossibleValue
}> {
  private readonly waitDataRef: React.RefObject<WaitData> = React.createRef<WaitData>();

  public render(): JSX.Element {
    return (
      <div style={{ display: 'inline-block', marginTop: 4, marginBottom: 6 }}>
        <WaitData<IObjectWithIndex>
          ref={this.waitDataRef}
          alwaysUpdate={true}
          extractFirstKey={!this.props.customQuery}
          query={this.props.customQuery || `{
          ${this.props.entity}ById(id: "${this.props.id}") {
            ${this.props.field}
          }
        }`}
        >
          {(data): JSX.Element => (
            <EditablePromisedComponent
              nonEditRender={() => {
                const renderData = this.props.customQuery ? data : data[this.props.field];

                return this.props.nonEditRender ? (this.props.nonEditRender(renderData)) : (renderData || NO_DATA_TEXT);
              }}
            >
              {React.cloneElement(this.props.children, {
                children: this.props.selectValueGenerator ? this.props.selectValueGenerator(data) : this.props.children.props.children,
                defaultChecked: this.props.customDefaultValue ? this.props.customDefaultValue(this.props.customQuery ? data : data[this.props.field]) : data[this.props.field],
                defaultValue: this.props.customDefaultValue ? this.props.customDefaultValue(this.props.customQuery ? data : data[this.props.field]) : data[this.props.field],
                promise: async (newValue: any) => {
                  if (this.props.valuePreSaveConverter) {
                    // tslint:disable-next-line:no-parameter-reassignment
                    newValue = this.props.valuePreSaveConverter(newValue);
                  }

                  let update = generateUpdate(this.props.entity, this.props.id, this.props.field, typeof (newValue) === 'string' ? newValue.replace(/"/g, '\\"') : newValue === undefined ? null : newValue).then((): void => {
                    notification.success({ message: this.props.successMessage });
                    if (this.waitDataRef.current) {
                      // tslint:disable-next-line:no-floating-promises
                      this.waitDataRef.current.updateData();
                    }
                  }).catch(reason => {
                    errorNotification(this.props.failMessage, reason.stack);
                    throw reason;
                  });

                  if (this.props.afterSave) {
                    update = update.then(this.props.afterSave);
                  }

                  return update;
                },
              })}
            </EditablePromisedComponent>
          )}
        </WaitData>
      </div>
    );
  }
}
