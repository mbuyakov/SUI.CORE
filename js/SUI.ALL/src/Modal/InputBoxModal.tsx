import {Input} from "antd";
import {TextAreaProps} from "antd/lib/input/TextArea";
import React from "react";

import {draw} from "../utils";

import {IPromisedBaseFormModalProps, PromisedBaseFormModal} from "./PromisedBaseFormModal";

export async function inputBoxModal<T>(title: string,
                                       formProps: IPromisedBaseFormModalProps<T> = null,
                                       inputProps: TextAreaProps = null,
validator: any = null,
                                       onSubmitCallback: (value: string) => Promise<boolean> = null): Promise<string> {
  return new Promise<string>(resolve => {
    const {TextArea} = Input;

    draw(
      <PromisedBaseFormModal
        defaultVisible={true}
        style={{minWidth: 300}}
        okText="Подтвердить"
        cancelText="Отменить"
        {...formProps}
        onSubmit={async (values: { text: string }) => {
          let successCallback = true;
          if (onSubmitCallback) {
            successCallback = await onSubmitCallback(values.text);
          }
          if (successCallback) {
            resolve(values.text);

            return true;
          }

          return false;
        }}
        onCancel={() => resolve(null)}
        baseFormProps={{
          rows: [
            {
              cols: {
                items: {
                  fieldName: "text",
                  inputNode: <TextArea rows={4} {...inputProps} />,
                  required: true,
                  rules: [{validator}],
                  title,
                }
              }
            }
          ],
          uuid: "input-box-modal-form",
        }}
      />
    );
  });
}
