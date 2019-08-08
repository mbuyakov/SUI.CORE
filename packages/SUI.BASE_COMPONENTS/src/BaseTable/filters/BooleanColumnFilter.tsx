import {TableFilterRow} from '@devexpress/dx-react-grid';
import {Icon} from 'antd';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {INewSearchProps} from '../types';

import { BaseSelectFilter } from './BaseSelectFilter';


export type BooleanColumnFilterProps = TableFilterRow.CellProps & INewSearchProps & {
  falseValue: string | number
  trueValue: string | number
};

export class BooleanColumnFilter extends React.Component<BooleanColumnFilterProps> {

  public render(): JSX.Element {
    return (
      <BaseSelectFilter
        {...this.props}
        disableSearch={true}
        onChange={this.onChange}
        data={[
          {
            title: <Icon type="check" theme="outlined"/>,
            value: this.props.trueValue !== undefined ? this.props.trueValue.toString() : 'true'
          }, {
            title: <Icon type="close" theme="outlined"/>,
            value: this.props.falseValue !== undefined ? this.props.falseValue.toString() : 'false'
          }
        ]}
      />
    );
  }

  @autobind
  private convertBooleanStringToBoolean(boolString: string | undefined): boolean | undefined {
    return boolString ? (boolString === (this.props.trueValue !== undefined ? this.props.trueValue.toString() : 'true')) : undefined;
  }

  @autobind
  private onChange(event: string): void {
    let value: string | number | boolean | undefined = this.convertBooleanStringToBoolean(event);
    if (this.props.trueValue !== undefined || this.props.falseValue !== undefined) {
      value = value ? (this.props.trueValue !== undefined ? this.props.trueValue : true) : (this.props.falseValue !== undefined ? this.props.falseValue : false);
    }
    // console.log(value, !!event);
    // tslint:disable-next-line:no-any
    event ? this.props.onFilter({value, operation: 'equal'} as any) : this.props.onFilter(null);
  }
}
