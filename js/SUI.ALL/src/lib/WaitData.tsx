/* tslint:disable:ban-ts-ignore */
import {Icon, Spin} from 'antd';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { loadingErrorNotification } from './drawUtils';
import { mutate, query, queryWrapper } from './gql';
import { SPIN_WRAPPER } from './styles';
import { defaultIfNotBoolean } from './typeWrappers';

const SPIN_DELAY = 300;


export type ChildrenType = JSX.Element[] | JSX.Element | string;
export type FunChildrenType<T> = (data: T, updateData?: () => void) => ChildrenType;

export interface IWaitDataProps<T> {
  alwaysUpdate?: boolean;
  children: ChildrenType | FunChildrenType<T>;
  data?: T;
  delay?: number;
  error?: boolean;
  errorTip?: string;
  // Deprecated. Analog - extractKeysLevel={1}
  extractFirstKey?: boolean;
  extractKeysLevel?: number;
  hideChildren?: boolean;
  // tslint:disable-next-line:no-any
  mutation?: string | any;
  promise?: Promise<T>;
  // tslint:disable-next-line:no-any
  query?: string | any;
  spinning?: boolean;
}

const errorIcon = (<Icon type="close-circle" theme="twoTone" twoToneColor="#d6083f" style={{fontSize: 24}}/>);

// tslint:disable-next-line:no-any
export class WaitData<T = any> extends React.Component<IWaitDataProps<T>, {
  data?: T | null | undefined | "__NULL__";
  error?: boolean;
}> {

  public constructor(props: IWaitDataProps<T>) {
    super(props);
    this.state = {};
  }

  public componentDidMount(): void {
    // tslint:disable-next-line:no-floating-promises
    this.updateData();
  }

  public render(): JSX.Element {
    // console.log(this);
    const data = (this.state && this.state.data) || this.props.data;
    // @ts-ignore
    const children = (): JSX.Element => (this.props.children instanceof Function) ? this.props.children(data === '__NULL__' ? null : data, this.updateData) : this.props.children;
    // console.log(data ? 'data' : 'no data');
    const hasErrors = this.props.error || (this.state && this.state.error);
    const spinning = !data || this.props.spinning;

    if(!hasErrors && !spinning) {
      return children();
    }

    return (
      <Spin
        wrapperClassName={SPIN_WRAPPER}
        delay={typeof this.props.delay === 'number' ? this.props.delay : SPIN_DELAY}
        spinning={spinning}
        indicator={hasErrors ? errorIcon : undefined}
        // tslint:disable-next-line:no-any
        tip={hasErrors && (<span style={{color: "red"}}>{this.props.errorTip}</span> as any)}
      >
        {(data || !defaultIfNotBoolean(this.props.hideChildren, true))
          ? children()
          : <div style={{height: '100%', width: '100%'}}/>
        }
      </Spin>
    );
  }

  public shouldComponentUpdate(nextProps: Readonly<IWaitDataProps<T>>): boolean {
    // console.log(nextProps, nextState);
    // tslint:disable-next-line:triple-equals
    if (this.props.query != nextProps.query) {
      if (this.state) {
        // @ts-ignore
        this.state.data = false;
      }
      // @ts-ignore
      this.props = nextProps;
      // tslint:disable-next-line:no-floating-promises
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
      // tslint:disable-next-line:no-promise-as-boolean
      if (promise) {
        console.error('[WaitData]Props conflict! Defined promise and query. Props:', this.props);
        this.setState({error: true});

        return;
      }
      promise = queryWrapper(query(this.props.query, this.props.extractFirstKey || this.props.extractKeysLevel));
    }
    if (this.props.mutation) {
      // tslint:disable-next-line:no-promise-as-boolean
      if (promise) {
        console.error('[WaitData]Props conflict! Defined promise and mutation. Props:', this.props);
        this.setState({error: true});

        return;
      }
      promise = queryWrapper(mutate(this.props.mutation, this.props.extractFirstKey || this.props.extractKeysLevel));
    }
    // tslint:disable-next-line:no-promise-as-boolean
    if (promise) {
      return promise
        .then(data => {
          // Workaround. Null in data are ok
          if (data === null) {
            // @ts-ignore
            // tslint:disable-next-line:no-parameter-reassignment
            data = '__NULL__';
          }
          if (typeof data === 'object') {
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
