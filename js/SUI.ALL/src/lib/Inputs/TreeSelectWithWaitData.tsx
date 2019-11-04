import {TreeSelect} from 'antd';
import {TreeNode, TreeSelectProps} from 'antd/lib/tree-select';
import {TreeNodeValue} from "antd/lib/tree-select/interface";
import classNames from "classnames";
import * as React from "react";

import {TableInfoManager} from "../cache";
import {getDataByKey} from "../dataKey";
import {IGqlFilter} from "../gql";
import {ExtractProps} from "../other";
import {TREE_SELECT_DISABLE_GROUP_SELECTION} from "../styles";
import {getDataSet, getDataSetRender, getUser, IDataSet} from "../utils";

export class TreeSelectWithWaitData<TValue extends TreeNodeValue, TValueType = {}, TGroupType = {}>
  extends React.Component<Omit<TreeSelectProps<TValue>, 'treeData' | 'treeNodeFilterProp'> & {
  disableGroupSelection?: boolean;
  groupTableFilter?: IGqlFilter<TGroupType>;
  groupTableIdentifier: string;
  valueTableFilter?: IGqlFilter<TValueType>;
  valueTableIdentifier: string;
}, {
  dataSet?: IDataSet[];
  ready?: boolean;
  treeData?: TreeNode[];
}> {

  public constructor(props: ExtractProps<TreeSelectWithWaitData<TValue, TValueType, TGroupType>>) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
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

}
