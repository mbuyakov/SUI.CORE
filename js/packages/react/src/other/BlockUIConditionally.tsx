import {isLocalServer} from '@/utils';
import {Result} from "antd";
import autobind from "autobind-decorator";
import axios from 'axios';
import React, {ReactNode} from "react";

export interface IBlockUIConditionallyProps {
  header?: string | ReactNode;
  intervalToCheckBlocked?: number;
  intervalToCheckFree?: number;

  functionToCheck(): Promise<string | ReactNode>;
}

interface IBlockUIConditionallyState {
  blocked: boolean;
  message: string | ReactNode;
}

const MIN_INTERVAL_TO_CHECK = 500;
const DEFAULT_INTERVAL_TO_CHECK_IN_BLOCK_MODE = 60000;
const DEFAULT_INTERVAL_TO_CHECK_IN_FREE_MODE = 20000;
const DEFAULT_HEADER = "Работа системы заблокирована администратором";
const DEFAULT_MSG = "Пожалуйста, попробуйте зайти попозже"

export class BlockUIConditionally extends React.Component<IBlockUIConditionallyProps, IBlockUIConditionallyState> {
  private readonly blockedInterval: number;
  private currentTimerId: NodeJS.Timeout = null;
  private readonly freeInterval: number;

  public constructor(props: IBlockUIConditionallyProps) {
    super(props);
    this.state = {
      blocked: false,
      message: null,
    };

    this.freeInterval = this.props.intervalToCheckFree && this.props.intervalToCheckFree > MIN_INTERVAL_TO_CHECK
      ? this.props.intervalToCheckFree
      : DEFAULT_INTERVAL_TO_CHECK_IN_FREE_MODE;

    this.blockedInterval = this.props.intervalToCheckBlocked && this.props.intervalToCheckBlocked > MIN_INTERVAL_TO_CHECK
      ? this.props.intervalToCheckBlocked
      : DEFAULT_INTERVAL_TO_CHECK_IN_BLOCK_MODE;

    this.check();
  }

  public componentWillUnmount(): void {
    this.cleanInterval();
  }

  public render(): React.ReactNode {
    if (!this.state.blocked) {
      return this.props.children;
    }

    return (
      <Result
        status="error"
        title={this.props.header || DEFAULT_HEADER}
        subTitle={this.state.message || DEFAULT_MSG}
      />
    );
  }

  @autobind
  private check(): void {
    if (this.props.functionToCheck) {
      this.props.functionToCheck()
        .then((message: string | ReactNode): void => {
          if (this.state.message !== message) {
            this.runBlockMode(message);
          }
        })
        .catch(() => this.runFreeMode());
    }
  }

  @autobind
  private cleanInterval(): void {
    if (this.currentTimerId) {
      clearInterval(this.currentTimerId);
      this.currentTimerId = null;
    }
  }

  @autobind
  private runBlockMode(message: string | ReactNode): void {
    this.cleanInterval();
    this.setState({blocked: true, message});
    if (this.props.functionToCheck) {
      this.currentTimerId = setInterval(this.check, this.blockedInterval);
    }
  }

  @autobind
  private runFreeMode(): void {
    this.cleanInterval();
    this.setState({blocked: false, message: null});
    if (this.props.functionToCheck) {
      this.currentTimerId = setInterval(this.check, this.freeInterval);
    }
  }
}

export async function checkBlockUIFile(): Promise<string> {
  if (isLocalServer()) {
    return null;
  }
  const BLOCK_FILE_URL = '/static/block_ui.txt';

  return getFileText(BLOCK_FILE_URL);
}

export async function getFileText(filename: string): Promise<string> {
  return new Promise<string>((resolve: (message: string) => void,
                              reject: () => void): Promise<void> =>
    axios.get(filename)
      .then(response => {
        const successStatusCode = 200;
        if (response.status === successStatusCode) {
          resolve(response.data);
        } else {
          reject();
        }
      })
      .catch(reject)
  );
}
