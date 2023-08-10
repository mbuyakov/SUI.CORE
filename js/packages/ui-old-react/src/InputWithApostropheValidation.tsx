import {Button, InputProps, Popover} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import React, {ChangeEvent} from "react";
import {ExtractProps} from "@/other";
import {CustomFioInput} from "@/Inputs";


export type ValidatorFunc = (name: string | null) => string;

export function apostropheValidator(value: string | null): string {
  if (value && value.trim().length) {
    const statePrefix = getAcceptStateFromPrefix(value);
    if (statePrefix !== null && statePrefix !== AcceptState.START) {
      return "Ошибочный апостроф в фамилии";
    }
  }

  return "";
}

export function wrapWithApostropheValidator(validator: ValidatorFunc): (value: string | null) => string {
  return (value: string | null): string => apostropheValidator(value) || validator(value);
}

export type InputWithApostropheValidationProps = InputProps & {
  errorPlacement: "top" | "right" | "bottom" | "left" | null,
  input: React.ComponentClass<ExtractProps<CustomFioInput>>
  onChange?(value: string): void,
};

interface IInputWithApostropheValidationState {
  acceptState: AcceptState,
  focused: boolean,
}

export class InputWithApostropheValidation extends React.Component<InputWithApostropheValidationProps, IInputWithApostropheValidationState> {
  public constructor(props: InputWithApostropheValidationProps) {
    super(props);
    this.state = {
      acceptState: AcceptState.START,
      focused: true,
    };
  }

  public componentDidUpdate(prevProps: InputWithApostropheValidationProps,
                            prevState: IInputWithApostropheValidationState): void {
    if (prevState.acceptState != this.state.acceptState) {
      const hasApostrophe = countApostrophes(this.props.value as string) > 0;
      this.props.onChange(getPrefixedValue(this.props.value as string,
        this.state.acceptState,
        hasApostrophe));
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
          {React.createElement(this.props.input,
            {
              ...this.props,
              onBlur: this.onBlur,
              onChange: this.onChange,
              onFocus: this.onFocus,
              value: clearValue
            })
          }
        </Popover>
      </div>
    );
  }

  @autobind
  private getAcceptDeclineButtons(): React.JSX.Element {
    return (
      <span>
        <Button danger={true} size="small" onClick={this.onDeclineBtnClickHandler}>
          Отказаться
        </Button>&nbsp;
        <Button type="primary" size="small" onClick={this.onAcceptBtnClickHandler}>
          Разрешить
        </Button>
      </span>
    );
  }

  @autobind
  private getNewAcceptStateOnChange(apostrophesCount: number): AcceptState {
    if (apostrophesCount === 0) {
      return AcceptState.START;
    }
    if (this.state.acceptState === AcceptState.START) {
      return AcceptState.ASKING_USER;
    }

    return this.state.acceptState;
  }

  @autobind
  private onAcceptBtnClickHandler(): void {
    this.setState({acceptState: AcceptState.ACCEPTED});
  }

  @autobind
  private onBlur(): void {
    setTimeout(() => {
      this.setState({focused: false});
    }, 100);
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
  private onDeclineBtnClickHandler(): void {
    this.setState({acceptState: AcceptState.NOT_ACCEPTED});
  }

  @autobind
  private onFocus(): void {
    this.setState({focused: true});
  }
}

const PREFIX_REGEX = /(__\w+__)/;
const APOSTROPHE_REGEX = /['`]/g;

export enum AcceptState {
  START = "__START__",
  ASKING_USER = "__ASKING_USER__",
  ACCEPTED = "__ACCEPTED__",
  NOT_ACCEPTED = "__NOT_ACCEPTED__"
}

// Never returns ACCEPTED prefix, cause string value never contains such a prefix.
function getAcceptStateFromPrefix(s: string): AcceptState | null {
  if (s) {
    const matches = s.match(PREFIX_REGEX);
    if (matches !== null) {
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
    return s.replace(PREFIX_REGEX, "");
  }

  return s;
}

function countApostrophes(s: string): number {
  const ap_match = s.match(APOSTROPHE_REGEX);
  if (ap_match === null) {
    return 0;
  } else {
    return ap_match.length;
  }
}
