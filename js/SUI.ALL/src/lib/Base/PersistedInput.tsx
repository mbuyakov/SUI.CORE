/* tslint:disable:no-any */
import {WrappedFormUtils} from "antd/lib/form/Form";
import autobind from 'autobind-decorator';
import { debounce } from 'lodash';
import isEqual from "lodash/isEqual";
import * as React from 'react';

import { IObjectWithIndex } from '../other';

function getValueFromEvent(e: any): any {
  // To support custom element
  if (!e || !e.target) {
    return e;
  }
  if( typeof e === "object" && typeof e.persist === "function") {
    e.persist();
  } else {
    console.warn("Unknown event type", e);
  }
  const { target } = e;

  return target.type === 'checkbox' ? target.checked : target.value;
}

export interface IPersistedInputProps {
  alwaysUpdate?: boolean;
  children: JSX.Element;
  customInputNodesTags?: IObjectWithIndex;
  fieldNameKostyl: string;
  formKostyl: WrappedFormUtils;
  initialValue?: any;
  requiredKostyl: boolean;
  value?: any;
  onChange?(e: any): void;
}

export interface IPersistedInputState {
  value?: any;
}

export class PersistedInput extends React.Component<IPersistedInputProps, IPersistedInputState> {

  private readonly debounceFn: (e: any, onChange?: (e: any) => any) => void = debounce((e, onChange) => {
    if(!onChange) {
      throw new Error("No onChange in props for field");
    }
    onChange(e);
    this.useExternalValue = true;
  }, 500);

  private useExternalValue: boolean = true;

  public constructor(props: IPersistedInputProps) {
    super(props);
    this.state = {};
  }

  public componentDidUpdate(prevProps: IPersistedInputProps): void {
    if(this.props.requiredKostyl !== prevProps.requiredKostyl) {
      this.props.formKostyl.validateFields([this.props.fieldNameKostyl]);
    }

    if(!isEqual(this.props.value, this.state.value) && this.useExternalValue) {
      this.setState({value: this.props.value});
    }
  }

  public render(): React.ReactNode {
    const {children, customInputNodesTags, ...restProps} = this.props;

    return React.cloneElement(children, {...customInputNodesTags, ...restProps, value: this.state.value, onChange: this.onChangeInternal });
  }

  public shouldComponentUpdate(nextProps: Readonly<IPersistedInputProps>, nextState: Readonly<IPersistedInputState>): boolean {
    return this.props.alwaysUpdate
      || nextProps.alwaysUpdate
      || !isEqual(this.state, nextState)
      || !isEqual(this.props.value, nextProps.value)
      || !isEqual(this.props.customInputNodesTags, nextProps.customInputNodesTags)
      || !isEqual(this.props.initialValue, nextProps.initialValue)
      || !isEqual(this.props.requiredKostyl, nextProps.requiredKostyl);
  }

  @autobind
  private onChangeInternal(e: any): void {
    if(this.props.children.props.onChange) {
      this.props.children.props.onChange(e);
    }
    this.useExternalValue = false;
    this.setState({value: getValueFromEvent(e)});
    this.debounceFn(e, this.props.onChange);
  }
}
