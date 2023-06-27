import {Popconfirm, PopconfirmProps} from "@sui/deps-antd";
import React, {useState} from "react";

export type IPopconfirmSettings = Omit<PopconfirmProps, 'onConfirm' | 'onCancel' | 'visible'>;

export interface IusePopconfirmState {
  wrapper(element: JSX.Element): JSX.Element;

  getResult(): Promise<boolean>;
}

export const usePopconfirm: (settings?: IPopconfirmSettings) => IusePopconfirmState = (settings) => {
  const [visible, setVisible] = useState(false);
  const [actions, setActions] = useState<{ onConfirm(): void, onCancel(): void }>();

  const wrapper = (element): JSX.Element => settings
    ? (
      <Popconfirm
        visible={visible}
        onCancel={actions?.onCancel}
        onConfirm={actions?.onConfirm}
        {...settings}
      >
        {element}
      </Popconfirm>
    )
    : element;

  const getResult = (): Promise<boolean> => new Promise(resolve => {
    if (!settings) {
      resolve(true);
    }

    setActions({
      onConfirm() {
        setVisible(false);
        resolve(true);
      },
      onCancel() {
        setVisible(false);
        resolve(false);
      }
    });
    setVisible(true);
  });

  return {
    wrapper,
    getResult
  };
}
