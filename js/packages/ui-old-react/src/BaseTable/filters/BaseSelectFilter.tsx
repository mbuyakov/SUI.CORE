/* eslint-disable @typescript-eslint/no-explicit-any */
import {Select, SelectProps} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import isEqual from "lodash/isEqual";
import * as React from "react";

import {getDataByKey} from "@sui/util-chore";
import {SelectValue} from "@/antdMissedExport";
import {ICommonColumnSearchProps, LazyTableFilterRowCellProps} from "../types";


export interface ISelectColumnFilterData {
  title?: string | React.JSX.Element;
  value: string | number;
}

export type IBaseSelectFilterProps<T> = LazyTableFilterRowCellProps
  & ICommonColumnSearchProps
  & Omit<SelectProps<T>, "disabled" | "value" | "onChange" | "onDropdownVisibleChange">
  & {
  data?: ISelectColumnFilterData[];
  onChange?(value: T): void
};

interface IBaseSelectFilterState<T> {
  data?: ISelectColumnFilterData[];
  value?: T;
}

export class BaseSelectFilter<T = SelectValue> extends React.Component<IBaseSelectFilterProps<T>, IBaseSelectFilterState<T>> {

  private dropdownVisible: boolean = false;

  constructor(props: Readonly<IBaseSelectFilterProps<T>> | IBaseSelectFilterProps<T>) {
    super(props);
    if (this.props.mode == "multiple") {
      this.state = {
        value: this.props.filter?.value || undefined as any,
      };
    }
  }

  public componentDidMount(): void {
    this.updateStateData();
  }

  public componentDidUpdate(prevProps: IBaseSelectFilterProps<T>): void {
    if (!isEqual(this.props.data, prevProps.data)) {
      this.updateStateData();
    }

    const stateValue = this.state.value || undefined;
    const prevPropsValue = prevProps.filter?.value || undefined;
    const curPropsValue = this.props.filter?.value || undefined;

    if (!isEqual(prevPropsValue, curPropsValue) && !isEqual(stateValue, curPropsValue)) {
      this.setState({value: curPropsValue as any});
    }
  }

  public render(): React.JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {defaultValue, ...restProps} = this.props;
    //const filterValue = this.props.mode == "multiple" ? (this.props.disabled ? getDataByKey(this.props.filter, "value") : this.state?.value) : getDataByKey(this.props.filter, "value");
    const filterValue = this.props.mode == "multiple" ? this.state?.value : getDataByKey(this.props.filter, "value");

    return (
      <Select<any>
        showSearch={true}
        optionFilterProp="children"
        allowClear={true}
        disabled={this.props.disabled}
        virtual={false}
        placeholder={<span style={{fontWeight: 400}}>{this.props.placeholder || "Фильтр..."}</span>}
        {...restProps}
        value={
          filterValue != null
            ? (Array.isArray(filterValue) ? filterValue : filterValue.toString())
            : undefined
        }
        style={{
          width: "100%",
          ...this.props.style
        }}
        onClear={this.onClear}
        onChange={this.onChange}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
      >
        {(this.state && this.state.data || [])
          .filter(element => element.value)
          .map(element => (
            <Select.Option
              key={element.value.toString()}
              value={element.value}
            >
              {element.title || element.value}
            </Select.Option>
          ))}
      </Select>
    );
  }

  @autobind
  private onChange(value: T): void {
    if (this.props.mode == "multiple") {
      this.setState(
        {value},
        () => {
          if (!this.dropdownVisible) {
            this._onChange(value);
          }
        }
      );
    } else {
      this._onChange(value);
    }
  }

  @autobind
  private _onChange(value: T): void {
    if (this.props.onChange) {
      this.props.onChange(value);
    } else {
      this.props.onFilter({
        columnName: this.props.column.name,
        operation: "equal",
        value: value as any
      });
    }
  }

  @autobind
  private onDropdownVisibleChange(opened: boolean): void {
    this.dropdownVisible = opened;

    const triggerChange = !opened
      && this.props.mode == "multiple"
      && !isEqual(this.props.filter?.value || undefined, this.state?.value || undefined);

    if (triggerChange) {
      this._onChange(this.state?.value);
    }
  }

  @autobind
  private onClear(): void {
    if (this.props.mode == "multiple") {
      this.setState(
        {value: undefined},
        () => this._onChange([] as unknown as T)
      );
    }
  }

  @autobind
  private updateStateData(): void {
    const dataElementByValue = new Map<string | null, ISelectColumnFilterData>();
    (this.props.data || []).forEach((element): void => {
      if (!dataElementByValue.has(element.value && element.value.toString())) {
        dataElementByValue.set(element.value && element.value.toString(), element);
      }
    });

    this.setState({data: Array.from(dataElementByValue.values())});
  }

}
