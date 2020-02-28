/* tslint:disable:jsx-no-lambda typedef no-any */
import { notification } from 'antd';
import { OptionCoreData } from 'rc-select/lib/interface';
import * as React from 'react';

import { NO_DATA_TEXT } from './const';
import { errorNotification } from './drawUtils';
import { generateUpdate, PossibleId, PossibleValue } from './gql/queryGenerator';
import {EditablePromisedComponent, IEditablePromisedComponentProps, IPromisedBaseProps} from './Inputs';
import { IObjectWithIndex } from './other';
import { WaitData } from './WaitData';

export interface IEditableEntityFieldProps<T> extends Omit<IEditablePromisedComponentProps<T>, "children"> {
  children: React.ReactElement<Omit<IPromisedBaseProps<T>, 'promise'>>;
  customQuery?: string;
  entity: string;
  failMessage: string;
  field: string;
  id: PossibleId;
  successMessage: string;
  afterSave?(): Promise<void>;
  customDefaultValue?(value: T): any;
  selectValueGenerator?(data: any): Array<React.ReactElement<OptionCoreData>>;
  valuePreSaveConverter?(value: T): PossibleValue;
}

export class EditableEntityField<T = any> extends React.Component<IEditableEntityFieldProps<T>> {
  private readonly waitDataRef: React.RefObject<WaitData> = React.createRef<WaitData>();

  public render(): JSX.Element {
    return (
      <div style={{ display: 'inline-block' }}>
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
              {...this.props}
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
