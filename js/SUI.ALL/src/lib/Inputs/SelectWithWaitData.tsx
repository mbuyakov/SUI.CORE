import {Select} from 'antd';
import {SelectProps} from 'antd/lib/select';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {TableInfoManager} from "../cache";
import {NO_DATA_TEXT} from "../const";
import {getDataByKey} from "../dataKey";
import {IGqlFilter} from "../gql";
import {ExtractProps} from "../other";
import {getDataSet, getDataSetRender, getUser, IDataSet} from "../utils";

export class SelectWithWaitData<TValueType = {}, TGroupType = {}>
  extends React.Component<Omit<SelectProps, 'mode'> & {
  groupTableFilter?: IGqlFilter<TGroupType>;
  groupTableIdentifier?: string;
  multiple?: boolean;
  valueTableFilter?: IGqlFilter<TValueType>;
  valueTableIdentifier: string;
}, {
  dataSet?: IDataSet[];
  options?: JSX.Element[];
  placeholder?: string;
  ready?: boolean;
}> {

  public constructor(props: ExtractProps<SelectWithWaitData<TValueType, TGroupType>>) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    const groupTableInfo = this.props.groupTableIdentifier && await TableInfoManager.getById(this.props.groupTableIdentifier);
    const valueTableInfo = await TableInfoManager.getById(this.props.valueTableIdentifier);

    const dataSet = await getDataSet<TValueType, TGroupType>(
      getDataByKey<string[]>(getUser(), "roles") || [],
      valueTableInfo,
      groupTableInfo,
      this.props.valueTableFilter,
      this.props.groupTableFilter
    );

    let options: JSX.Element[];
    let firstElement: IDataSet;

    if (groupTableInfo) {
      options = (dataSet || []).map(group => (
        <Select.OptGroup
          key={`g-${group.id}`}
          label={getDataSetRender(group)}
        >
          {this.generateOptions(group.children)}
        </Select.OptGroup>
      ));
      firstElement = getDataByKey(dataSet, 0, "children", 0);
    } else {
      options = this.generateOptions(dataSet);
      firstElement = getDataByKey(dataSet, 0);
    }

    this.setState({
      dataSet,
      options,
      placeholder: firstElement && getDataSetRender(firstElement),
      ready: true
    });
  }

  public getData(): IDataSet[] {
    return this.state.dataSet;
  }

  public render(): JSX.Element {
    const ready = this.state.ready;

    return (
      <Select
        allowClear={true}
        showSearch={true}
        {...this.props}
        // tslint:disable-next-line:triple-equals
        value={(this.props.value != null) ? this.props.value : undefined}
        style={{...this.props.style, ...(!ready && {filter: 'blur(1px)'})}}
        mode={this.props.multiple ? "multiple" : "default"}
        optionFilterProp="children"
        placeholder={this.props.placeholder || this.state.placeholder}
      >
        {this.state.options}
      </Select>
    );
  }

  @autobind
  private generateOptions(data: IDataSet[]): JSX.Element[] {
    return (data || []).map(element => (
      <Select.Option
        key={element.id}
        // TODO: toString is kostyl' for integer PK  tables (remove in future) value={element.id}
        // tslint:disable-next-line:triple-equals
        value={element.id != null ? String(element.id) : element.id}
      >
        {getDataSetRender(element) || NO_DATA_TEXT}
      </Select.Option>
    ))
  }

}