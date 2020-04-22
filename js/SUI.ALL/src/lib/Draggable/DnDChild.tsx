import * as React from "react";

import { getDataByKey } from '../dataKey';

declare let window: Window & {
  DnDChildData: {
    [id: string]: any;
  };
};

// Id mark as not required because DnDList add in automatically
export interface IBaseDnDChildProps {
  draggable?: boolean
  id?: string

  onDelete?(): void
}

export abstract class DnDChild<P extends IBaseDnDChildProps = IBaseDnDChildProps, S = {}> extends React.Component<P, S> {
  /**************************************************************************************************************
  * ANY PRIVATE VARS IN CLASS MAY BE RESETED WHEN DnD CONTAINER CHANGED. STATE SAVED AND RESTORE IN CONSTRUCTOR *
  ***************************************************************************************************************/

  protected constructor(props: P) {
    super(props);
    // DON'T USE AUTOBIND DECORATOR!!
    this.saveState = this.saveState.bind(this);

    if(props.id) {
      const savedState = getDataByKey<S>(window, 'DnDChildData', props.id);
      if (savedState) {
        this.state = savedState;
        // @ts-ignore
        delete window.DnDChildData[props.id];
      }
    }
  }

  public saveState(): void {
    if(this.props.id == null) {
      throw new Error("No ID");
    }
    if (!window.DnDChildData) {
      window.DnDChildData = {};
    }
    window.DnDChildData[this.props.id] = this.state;
  }

}
