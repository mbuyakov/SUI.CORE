import {Popconfirm, PopconfirmProps} from "@sui/deps-antd";
import React, {useState} from "react";

export type PopconfirmSettings = Omit<PopconfirmProps, "onConfirm" | "onCancel" | "open">;

export interface IUsePopconfirmState {
  wrapper(element: React.JSX.Element): React.JSX.Element;

  getResult(): Promise<boolean>;
}

export const usePopconfirm: (settings?: PopconfirmSettings) => IUsePopconfirmState = (settings) => {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<{ onConfirm(): void, onCancel(): void }>();

  const wrapper = (element: React.JSX.Element): React.JSX.Element => settings
    ? (
      <Popconfirm
        {...settings}
        open={open}
        onCancel={actions?.onCancel}
        onConfirm={actions?.onConfirm}
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
        setOpen(false);
        resolve(true);
      },
      onCancel() {
        setOpen(false);
        resolve(false);
      }
    });

    setOpen(true);
  });

  return {
    wrapper,
    getResult
  };
};
