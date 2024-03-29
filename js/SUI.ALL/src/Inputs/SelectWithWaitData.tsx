import {Select} from 'antd';
import {SelectProps, SelectValue} from 'antd/lib/select';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {TableInfoManager} from "../cache";
import {NO_DATA_TEXT} from "../const";
import {getDataByKey} from "../dataKey";
import {IGqlFilter} from "../gql";
import {ExtractProps} from "../other";
import {getDataSet, getDataSetRender, getUser, IDataSet} from "../utils";

export type ISelectWithWaitDataProps<TValueType, TGroupType> = Omit<SelectProps<SelectValue>, 'mode'> & {
  groupTableFilter?: IGqlFilter<TGroupType>;
  groupTableIdentifier?: string;
  multiple?: boolean;
  valueTableFilter?: IGqlFilter<TValueType>;
  valueTableIdentifier: string;
  watchFilter?: boolean;
  customOptionRender?(element: IDataSet): React.ReactNode;
}

export interface ISelectWithWaitDataState {
  dataSet?: IDataSet[];
  options?: JSX.Element[];
  placeholder?: string;
  ready?: boolean;
}

export class SelectWithWaitData<TValueType = {}, TGroupType = {}>
  extends React.Component<ISelectWithWaitDataProps<TValueType, TGroupType>, ISelectWithWaitDataState> {

  public constructor(props: ExtractProps<SelectWithWaitData<TValueType, TGroupType>>) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    return this.updateData();
  }

  public async componentDidUpdate(prevProps: Readonly<ISelectWithWaitDataProps<TValueType, TGroupType>> ): Promise<void> {
    if (this.props.watchFilter) {
      if (JSON.stringify(this.props.valueTableFilter) !== JSON.stringify(prevProps.valueTableFilter)) {
        await this.updateData();
      }
    }
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
        value={(this.props.value != null) ? this.props.value : undefined}
        style={{...this.props.style, ...(!ready && {filter: 'blur(1px)'})}}
        mode={this.props.multiple ? "multiple" : undefined}
        disabled={(this.state.dataSet && !ready) || this.props.disabled}
        optionFilterProp="children"
        placeholder={this.props.placeholder || this.state.placeholder}
      >
        {this.state.options}
      </Select>
    );
  }

  @autobind
  private generateOptions(data: IDataSet[]): JSX.Element[] {
    const optionRender = this.props.customOptionRender || getDataSetRender;

    return (data || []).map(element => (
      <Select.Option
        key={element.id}
        // TODO: toString is kostyl' for integer PK  tables (remove in future) value={element.id}
        value={element.id != null ? String(element.id) : element.id}
      >
        {optionRender(element) || NO_DATA_TEXT}
      </Select.Option>
    ))
  }

  @autobind
  private async updateData(): Promise<void> {
    if (this.state.ready) {
      this.setState({ready: false});
    }

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

}
