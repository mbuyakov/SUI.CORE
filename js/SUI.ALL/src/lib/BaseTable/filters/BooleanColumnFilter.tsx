import { Icon as LegacyIcon } from '@ant-design/compatible';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {INewSearchProps, LazyTableFilterRowCellProps} from '../types';

import {BaseSelectFilter} from './BaseSelectFilter';

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
            title: <LegacyIcon type="check" theme="outlined"/>,
            // tslint:disable-next-line:triple-equals
            value: this.props.trueValue != null ? this.props.trueValue.toString() : 'true'
          }, {
            title: <LegacyIcon type="close" theme="outlined"/>,
            // tslint:disable-next-line:triple-equals
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
      // tslint:disable-next-line:no-any
      ? this.props.onFilter({columnName: this.props.column.name, value: value as any, operation: 'equal'})
      : this.props.onFilter(null);
  }

}
