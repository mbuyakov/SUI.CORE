import {BaseSelectFilter} from '@/BaseTable';
import {CheckOutlined, CloseOutlined} from '@ant-design/icons';
import autobind from 'autobind-decorator';
import * as React from 'react';
import {INewSearchProps, LazyTableFilterRowCellProps} from "../types";

export type BooleanColumnFilterProps = LazyTableFilterRowCellProps
  & INewSearchProps & {
  falseValue?: string | number
  trueValue?: string | number
};

export class BooleanColumnFilter extends React.Component<BooleanColumnFilterProps & INewSearchProps> {

  public render(): JSX.Element {
    return (
      <BaseSelectFilter<string>
        {...this.props}
        showSearch={false}
        onChange={this.onChange}
        data={[
          {
            title: <CheckOutlined/>,
            value: this.props.trueValue != null ? this.props.trueValue.toString() : 'true'
          }, {
            title: <CloseOutlined/>,
            value: this.props.falseValue != null ? this.props.falseValue.toString() : 'false'
          }
        ]}
      />
    );
  }

  @autobind
  private convertBooleanStringToBoolean(boolString: string | undefined): boolean | null {
    return boolString ? (boolString === (this.props.trueValue !== undefined ? this.props.trueValue.toString() : 'true')) : null;
  }

  @autobind
  private onChange(event: string): void {
    let value: string | number | boolean | null = this.convertBooleanStringToBoolean(event);
    if (this.props.trueValue !== undefined || this.props.falseValue !== undefined) {
      value = value ? (this.props.trueValue !== undefined ? this.props.trueValue : true) : (this.props.falseValue !== undefined ? this.props.falseValue : false);
    }

    event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? this.props.onFilter({columnName: this.props.column.name, value: value as any, operation: 'equal'})
      : this.props.onFilter(null);
  }

}
