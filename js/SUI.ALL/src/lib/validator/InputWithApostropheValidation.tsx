import {Button, Input, Popover} from 'antd';
import React, {ChangeEvent} from 'react';
import autobind from 'autobind-decorator';
import {InputProps} from "antd/lib/input/Input";


export type ValidatorFunc = (name: string | null) => string;

export function apostropheValidator(value: string | null): string {
  if (value && value.trim().length) {
    let statePrefix = getAcceptStateFromPrefix(value);
    if (statePrefix !== null && statePrefix !== AcceptState.START) {
      return 'Ошибочный апостроф в фамилии';
    }
  }
  return '';
}

export function wrapWithApostropheValidator(validator: ValidatorFunc) {
  return (value: string | null) => {
    return apostropheValidator(value) || validator(value);
  };
}

export type InputWithApostropheValidationProps = InputProps & {
  errorPlacement: "top" | "right" | "bottom" | "left" | null,
  onChange?(value: string): void
}

type InputWithApostropheValidationState = {
  acceptState: AcceptState,
  focused: boolean,
}

export class InputWithApostropheValidation extends React.Component<InputWithApostropheValidationProps, InputWithApostropheValidationState> {
  constructor(props: InputWithApostropheValidationProps) {
    super(props);
    this.state = {
      acceptState: AcceptState.START,
      focused: true,
    };
  }

  public componentDidUpdate(prevProps: InputWithApostropheValidationProps,
                            prevState: InputWithApostropheValidationState): void {
    if (prevState.acceptState != this.state.acceptState) {
      const hasApostrophe = countApostrophes(this.props.value as string) > 0;
      this.props.onChange(getPrefixedValue(this.props.value as string,
        this.state.acceptState, hasApostrophe));
    }
  }

  public render(): React.ReactNode {
    const clearValue: string = dropPrefix(this.props.value as string || "");
    return (
      <div>
        <Popover
          content={this.getAcceptDeclineButtons()}
          title="" //Вы ввели апостроф в фамилии. Вы подтверждаете правильность ввода?"
          visible={this.state.acceptState === AcceptState.ASKING_USER}
          overlayStyle={{width: 215}}
          placement={this.props.errorPlacement === null ? "top" : this.props.errorPlacement}
        >
          <Input
            {...this.props}
            value={clearValue}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
        </Popover>
      </div>
    );
  }

  @autobind
  private onChange(e: ChangeEvent<HTMLInputElement>): void {
    const apCount = countApostrophes(e.target.value);
    const newAcceptState = this.getNewAcceptStateOnChange(apCount);
    if (newAcceptState !== this.state.acceptState) {
      this.setState({acceptState: newAcceptState});
    }
    const newValue = getPrefixedValue(e.target.value, newAcceptState, apCount > 0);
    if (this.props.value !== newValue) {
      this.props.onChange(newValue);
    }
  }

  @autobind
  private onFocus(): void {
    this.setState({focused: true});
  }

  @autobind
  private onBlur(): void {
    setTimeout(() => {
      this.setState({focused: false});
    }, 100);
  }

  @autobind
  private getNewAcceptStateOnChange(apostrophesCount: number) {
    if (apostrophesCount === 0) {
      return AcceptState.START;
    }
    if (this.state.acceptState === AcceptState.START) {
      return AcceptState.ASKING_USER;
    }
    return this.state.acceptState;
  }

  @autobind
  private getAcceptDeclineButtons() {
    return (
      <span>
        <Button type="danger" size="small" onClick={ this.onDeclineBtnClickHandler }>
          Отказаться
        </Button>&nbsp;
        <Button type="primary" size="small" onClick={ this.onAcceptBtnClickHandler }>
          Разрешить
        </Button>
      </span>
    );
  }

  @autobind
  private onAcceptBtnClickHandler() {
    this.setState({acceptState: AcceptState.ACCEPTED});
  }

  @autobind
  private onDeclineBtnClickHandler() {
    this.setState({acceptState: AcceptState.NOT_ACCEPTED});
  }
}

const PREFIX_REGEX = /(__\w+__)/;
const APOSTROPHE_REGEX = /'/g;

export enum AcceptState {
  START = "__START__",
  ASKING_USER = "__ASKING_USER__",
  ACCEPTED = "__ACCEPTED__",
  NOT_ACCEPTED = "__NOT_ACCEPTED__"
}

// Never returns ACCEPTED prefix, cause string value never contains such a prefix.
function getAcceptStateFromPrefix(s: string): AcceptState | null {
  if(s) {
    const matches = s.match(PREFIX_REGEX);
    if(matches !== null) {
      return AcceptState[matches[0]];
    }
  }
  return null;
}

function isPrefixNeeded(value: string, acceptState: AcceptState, hasApostrophe: boolean): boolean {
  return value !== null
    && acceptState !== AcceptState.ACCEPTED
    && hasApostrophe;
}

function getPrefixedValue(value: string, acceptState: AcceptState, hasApostrophe: boolean): string {
  const cleanValue = dropPrefix(value);
  if (isPrefixNeeded(value, acceptState, hasApostrophe)) {
    return addPrefix(cleanValue, acceptState);
  }
  return cleanValue;
}

function addPrefix(s: string, prefix: string): string {
  if (prefix === null) {
    return s;
  }
  return `${prefix}${s}`;
}

function dropPrefix(s: string): string {
  if (s) {
    return s.replace(PREFIX_REGEX, '');
  }
  return s;
}

function countApostrophes(s: string) {
  let ap_match = s.match(APOSTROPHE_REGEX);
  if (ap_match === null) {
    return 0;
  } else {
    return ap_match.length;
  }
}

function hasPrefix(s: string): boolean {
  return s && PREFIX_REGEX.test(s);
}
