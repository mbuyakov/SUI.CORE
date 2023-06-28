import autobind from "autobind-decorator";
import * as React from "react";

import {INN_MASK} from "@sui/ui-old-core";
import {SUIMaskedInput} from "@/SUIMaskedInput";
import {INewSearchProps, LazyTableFilterRowCellProps} from "../types";

export type IInnColumnFilterProps = React.PropsWithChildren<LazyTableFilterRowCellProps & INewSearchProps>;

export interface IInnColumnFilterState {
  lastFilterValue?: string;
  value?: string;
}

export class InnColumnFilter extends React.Component<IInnColumnFilterProps, IInnColumnFilterState> {

  public constructor(props: IInnColumnFilterProps) {
    super(props);

    const value = this.props.filter?.value || "";

    this.state = {lastFilterValue: value, value};
  }

  public componentDidUpdate(): void {
    const value = this.props.filter?.value || "";

    if (value !== this.state.lastFilterValue) {
      this.setState({
        lastFilterValue: value,
        value
      });
    }
  }

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {children, ...clearProps} = this.props;

    return (
      <SUIMaskedInput
        {...clearProps}
        allowClear={true}
        mask={INN_MASK}
        placeholder={this.props.placeholder as string || "Фильтр..."}
        value={this.state.value}
        onChange={this.onChange}
        onPressEnter={this.onPressEnter}
        onBlur={this.onBlur}
      />
    );
  }

  @autobind
  private onBlur(): void {
    this.triggerFilter(true);
  }

  @autobind
  private onChange(value: string, event: React.ChangeEvent<HTMLInputElement>): void {

    this.setState({value}, () => {
      // Trigger on clearButton click
      if (event.type === "click" && value === "") {
        this.triggerFilter(true);
      }
    });
  }

  @autobind
  private onPressEnter(): void {
    this.triggerFilter(false);
  }

  @autobind
  private triggerFilter(lazy: boolean): void {
    const value = this.state.value;

    if (!lazy || (this.state.lastFilterValue !== value)) {
      this.props.onFilter({
        columnName: this.props.column.name,
        lazy,
        operation: this.props.operation || "contains",
        value
      });
      this.setState({lastFilterValue: value});
    }
  }

}
