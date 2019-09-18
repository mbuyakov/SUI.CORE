/* tslint:disable:ban-ts-ignore */
import {getDataByKey} from "@smsoft/sui-core";
import autobind from "autobind-decorator";
import * as React from "react";

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

    if(props.id) {
      const savedState = getDataByKey<S>(window, 'DnDChildData', props.id);
      if (savedState) {
        this.state = savedState;
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore
        // tslint:disable-next-line:no-dynamic-delete
        delete window.DnDChildData[props.id];
      }
    }
  }

  @autobind
  public saveState(): void {
    // tslint:disable-next-line:triple-equals
    if(this.props.id == null) {
      throw new Error("No ID");
    }
    // @ts-ignore
    if (!window.DnDChildData) {
      // @ts-ignore
      window.DnDChildData = {};
    }
    // @ts-ignore
    window.DnDChildData[this.props.id] = this.state;
  }

}
