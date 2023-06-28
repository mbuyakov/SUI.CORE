/* eslint-disable @typescript-eslint/no-explicit-any */
import {notification} from "@sui/deps-antd";
import * as React from "react";

import {formatRawForGraphQL, generateUpdate, IObjectWithIndex, NO_DATA_TEXT, PossibleId, PossibleValue} from "@sui/ui-old-core";
import {errorNotification} from "./drawUtils";

import {EditablePromisedComponent, IEditablePromisedComponentProps, IPromisedBaseProps} from "./Inputs";
import {WaitData} from "./WaitData";


export interface IEditableEntityFieldProps<T> extends Omit<IEditablePromisedComponentProps<T>, "children"> {
  children: React.ReactElement<Omit<IPromisedBaseProps<T>, "promise">>;
  customQuery?: string;
  entity: string;
  failMessage: string;
  field: string;
  id: PossibleId;
  successMessage: string;

  afterSave?(value: T): Promise<void>;

  customDefaultValue?(value: T): any;

  selectValueGenerator?(data: any): JSX.Element[];

  valuePreSaveConverter?(value: T): PossibleValue;
}

export class EditableEntityField<T = any> extends React.Component<IEditableEntityFieldProps<T>> {
  private readonly waitDataRef: React.RefObject<WaitData> = React.createRef<WaitData>();

  public render(): JSX.Element {
    // @ts-ignore
    const childrenWidth = this.props.children?.props?.style?.width ?? this.props.children?.props?.style?.minWidth;
    return (
      <div style={{display: "inline-block", width: (childrenWidth && typeof childrenWidth == "number") ? childrenWidth + 75/* button block width */ : undefined}}>
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
              nonEditRender={(): React.ReactNode => {
                const renderData = this.props.customQuery ? data : data[this.props.field];
                return this.props.nonEditRender ? (this.props.nonEditRender(renderData)) : (renderData || NO_DATA_TEXT);
              }}
            >
              {
                React.cloneElement(this.props.children, {
                // @ts-ignore
                children: this.props.selectValueGenerator ? this.props.selectValueGenerator(data) : this.props.children.props.children,
                defaultChecked: this.props.customDefaultValue ? this.props.customDefaultValue(this.props.customQuery ? data : data[this.props.field]) : data[this.props.field],
                defaultValue: this.props.customDefaultValue ? this.props.customDefaultValue(this.props.customQuery ? data : data[this.props.field]) : data[this.props.field],
                promise: async (newValue: any) => {
                  let valueForUpdate = this.props.valuePreSaveConverter
                    ? this.props.valuePreSaveConverter(newValue)
                    : newValue;

                  valueForUpdate = typeof (valueForUpdate) === "string"
                    ? formatRawForGraphQL(valueForUpdate)
                    : valueForUpdate === undefined
                      ? null
                      : valueForUpdate;
                  let update = generateUpdate(this.props.entity, this.props.id, this.props.field, valueForUpdate)
                    .then((): void => {
                      notification.success({message: this.props.successMessage});
                      if (this.waitDataRef.current) {
                        this.waitDataRef.current.updateData();
                      }
                    }).catch(reason => {
                      errorNotification(this.props.failMessage, reason.stack);
                      throw reason;
                    });

                  if (this.props.afterSave) {
                    update = update.then((): Promise<void> => this.props.afterSave(valueForUpdate));
                  }

                  return update;
                },
              }) as any}
            </EditablePromisedComponent>
          )}
        </WaitData>
      </div>
    );
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  public async updateData(): Promise<void> {
    return this.waitDataRef.current.updateData();
  }
}
