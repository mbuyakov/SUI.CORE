import {TreeSelect} from 'antd';
import {TreeNode, TreeSelectProps} from 'antd/lib/tree-select';
import {TreeNodeValue} from "antd/lib/tree-select/interface";
import autobind from "autobind-decorator";
import classNames from "classnames";
import * as React from "react";

import {TableInfoManager} from "../cache";
import {getDataByKey} from "../dataKey";
import {IGqlFilter} from "../gql";
import {TREE_SELECT_DISABLE_GROUP_SELECTION} from "../styles";
import {getDataSet, getDataSetRender, getUser, IDataSet} from "../utils";

export type ITreeSelectWithWaitDataProps<TValue extends TreeNodeValue, TValueType, TGroupType> =
  Omit<TreeSelectProps<TValue>, 'treeData' | 'treeNodeFilterProp'> & {
  disableGroupSelection?: boolean;
  groupTableFilter?: IGqlFilter<TGroupType>;
  groupTableIdentifier: string;
  valueTableFilter?: IGqlFilter<TValueType>;
  valueTableIdentifier: string;
  watchFilter?: boolean;
}

export interface ITreeSelectWithWaitDataState {
  dataSet?: IDataSet[];
  ready?: boolean;
  treeData?: TreeNode[];
}

export class TreeSelectWithWaitData<TValue extends TreeNodeValue, TValueType = {}, TGroupType = {}>
  extends React.Component<ITreeSelectWithWaitDataProps<TValue, TValueType, TGroupType>, ITreeSelectWithWaitDataState> {

  public constructor(props: ITreeSelectWithWaitDataProps<TValue, TValueType, TGroupType>) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    return this.updateData();
  }

  public async componentDidUpdate(prevProps: Readonly<ITreeSelectWithWaitDataProps<TValue, TValueType, TGroupType>>): Promise<void> {
    if (this.props.watchFilter) {
      if (JSON.stringify(this.props.valueTableFilter) !== JSON.stringify(prevProps.valueTableFilter)
        || JSON.stringify(this.props.groupTableFilter) !== JSON.stringify(prevProps.groupTableFilter)) {
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
      <TreeSelect
        allowClear={true}
        showSearch={true}
        showCheckedStrategy="SHOW_PARENT"
        {...this.props}
        style={{...this.props.style, ...(!ready && {filter: 'blur(0.5px)'})}}
        treeData={this.state.treeData}
        treeNodeFilterProp="title"
        dropdownClassName={classNames(
          this.props.dropdownClassName,
          this.props.disableGroupSelection && TREE_SELECT_DISABLE_GROUP_SELECTION
        )}
        placeholder={this.props.placeholder || getDataByKey(this.state.treeData, 0, "children", 0, "title") || null}
      />
    );
  }

  @autobind
  private async updateData(): Promise<void> {
    if (this.state.ready) {
      this.setState({ready: false});
    }

    const groupTableInfo = this.props.groupTableIdentifier && await TableInfoManager.getById(this.props.groupTableIdentifier);
    const valueTableInfo = await TableInfoManager.getById(this.props.valueTableIdentifier);

    const dataSet = await getDataSet(
      getDataByKey<string[]>(getUser(), "roles") || [],
      valueTableInfo,
      groupTableInfo,
      this.props.valueTableFilter,
      this.props.groupTableFilter
    );

    const disableGroupSelection = this.props.disableGroupSelection;

    this.setState({
      dataSet,
      ready: true,
      treeData: (dataSet || [])
        .filter(group => group.children && group.children.length)
        .map(group => ({
          children: (group.children || []).map(element => ({
            isLeaf: true,
            key: `${element.id}`,
            title: getDataSetRender(element),
            value: `${element.id}`
          })),
          disableCheckbox: disableGroupSelection,
          isLeaf: false,
          key: `${groupTableInfo.tableName}-${group.id}`,
          selectable: !disableGroupSelection,
          title: getDataSetRender(group),
          value: `${groupTableInfo.tableName}-${group.id}`
        }))
    });
  }

}
