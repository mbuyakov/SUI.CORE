import {Popconfirm, PopconfirmProps} from "antd";
import React, {useState} from "react";

export type IPopconfirmSettings = Omit<PopconfirmProps, 'onConfirm' | 'onCancel' | 'visible'>;

export interface usePopconfirmState {
  visible: boolean;

  wrapper(element: JSX.Element): JSX.Element;

  getResult(): Promise<boolean>;
}

export const usePopconfirm: (settings?: IPopconfirmSettings) => usePopconfirmState = (settings) => {
  const [visible, setVisible] = useState(false);
  const [actions, setActions] = useState<{ onConfirm(): void, onCancel(): void }>();

  const wrapper = (element) => settings
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

  const getResult = () => new Promise<boolean>(resolve => {
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
    visible,
    wrapper,
    getResult
  }
}
