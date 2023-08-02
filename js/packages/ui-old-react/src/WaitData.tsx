/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import {CloseCircleTwoTone} from "@ant-design/icons";
import {defaultIfNotBoolean, mutate, query} from "@sui/ui-old-core";
import {Spin} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import * as React from "react";
import {queryWrapper} from "@/tmp";

import {loadingErrorNotification} from "./drawUtils";
import {SPIN_WRAPPER} from "./styles";

const SPIN_DELAY = 300;


export type ChildrenType = React.JSX.Element[] | React.JSX.Element | string;
export type FunChildrenType<T> = (data: T, updateData?: () => void) => ChildrenType;

export interface IWaitDataProps<T> {
  alwaysUpdate?: boolean;
  children: ChildrenType | FunChildrenType<T>;
  data?: T;
  delay?: number;
  disableUnwrapOnReady?: boolean;
  error?: boolean;
  errorTip?: string;
  // Deprecated. Analog - extractKeysLevel={1}
  extractFirstKey?: boolean;
  extractKeysLevel?: number;
  hideChildren?: boolean;
  mutation?: string | any;
  promise?: Promise<T>;
  query?: string | any;
  spinning?: boolean;
  watchPromise?: boolean;
}

const errorIcon = (<CloseCircleTwoTone twoToneColor="#d6083f" style={{fontSize: 24}}/>);

export class WaitData<T = any> extends React.Component<IWaitDataProps<T>, {
  data?: T | null | undefined | "__NULL__";
  error?: boolean;
}> {

  public constructor(props: IWaitDataProps<T>) {
    super(props);
    this.state = {};
  }

  public componentDidMount(): Promise<void> {
    return this.updateData();
  }

  public render(): React.JSX.Element {
    const data = (this.state && this.state.data) || this.props.data;
    // @ts-ignore
    const children = (): React.JSX.Element => (this.props.children instanceof Function) ? this.props.children(data === "__NULL__" ? null : data, this.updateData) : this.props.children;
    const hasErrors = this.props.error || (this.state && this.state.error);
    const spinning = hasErrors || !data || !!this.props.spinning;

    if (!spinning && !this.props.disableUnwrapOnReady) {
      return children();
    }

    return (
      <Spin
        wrapperClassName={SPIN_WRAPPER}
        delay={typeof this.props.delay === "number" ? this.props.delay : SPIN_DELAY}
        spinning={spinning}
        indicator={hasErrors ? errorIcon : undefined}
        tip={hasErrors && (<span style={{color: "red"}}>{this.props.errorTip}</span> as any)}
      >
        {(data || !defaultIfNotBoolean(this.props.hideChildren, true))
          ? children()
          : <div style={{height: "100%", width: "100%"}}/>
        }
      </Spin>
    );
  }

  public shouldComponentUpdate(nextProps: Readonly<IWaitDataProps<T>>): boolean {
    // console.log(nextProps, nextState);
    const shouldUpdateData = (this.props.query != nextProps.query)
      || (this.props.mutation != nextProps.mutation)
      || (nextProps.watchPromise && this.props.promise != nextProps.promise);

    if (shouldUpdateData) {
      if (this.state) {
        // @ts-ignore
        // noinspection JSConstantReassignment
        this.state.data = false;
      }
      // @ts-ignore
      // noinspection JSConstantReassignment
      this.props = nextProps;
      // noinspection JSIgnoredPromiseFromCall
      this.updateData();

      return true;
    }

    return this.props.alwaysUpdate || !((this.state && this.state.data) || this.props.data);
  }

  @autobind
  public async updateData(clearData: boolean = true): Promise<void> {
    if (this.state.data && clearData) {
      this.setState({data: null});
    }
    let promise = this.props.promise;
    if (this.props.query) {
      if (promise) {
        console.error("[WaitData]Props conflict! Defined promise and query. Props:", this.props);
        this.setState({error: true});

        return;
      }
      promise = queryWrapper(query(this.props.query, this.props.extractFirstKey || this.props.extractKeysLevel));
    }
    if (this.props.mutation) {
      if (promise) {
        console.error("[WaitData]Props conflict! Defined promise and mutation. Props:", this.props);
        this.setState({error: true});

        return;
      }
      promise = queryWrapper(mutate(this.props.mutation, this.props.extractFirstKey || this.props.extractKeysLevel));
    }
    if (promise) {
      return promise
        .then(data => {
          // Workaround. Null in data are ok
          if (data === null) {
            // @ts-ignore
            data = "__NULL__";
          }
          if (typeof data === "object") {
            // Magic. May have false-positive error
            const keys = Object.keys(data);
            if (keys.length === 1) {
              // @ts-ignore
              if (data[keys[0]] === null) {
                loadingErrorNotification("Данные не найдены");
                this.setState({error: true});

                return undefined;
              }
            }
          }
          this.setState({data});
        })
        .catch(reason => {
          console.error(reason);
          this.setState({error: true});
        });
    }
  }
}
