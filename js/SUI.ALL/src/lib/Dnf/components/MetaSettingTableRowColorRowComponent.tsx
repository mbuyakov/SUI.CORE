import {Form, Select} from "antd";
import autobind from 'autobind-decorator';
import * as React from "react";

import { ColumnInfo } from '../../cache';
import { getFilterType } from '../../utils';
import { getActions } from '../utils';

import {IFilterProps, IParameterRowElementBase, ParameterRowComponent} from "./ParameterRowComponent";

const offset = 4;

export interface IMetaSettingTableRowColorRowElement extends IParameterRowElementBase {
  firstColumnInfoId?: string;
  secondColumnInfoId?: string;
}

interface IMetaSettingTableRowColorRowComponentProps {
  columnInfos: ColumnInfo[];
}

export class MetaSettingTableRowColorRowComponent
  extends ParameterRowComponent<IMetaSettingTableRowColorRowElement, IMetaSettingTableRowColorRowComponentProps> {

  public render(): JSX.Element {
    return this.createParameterRow({
      filterPropsGenerator: this.filterPropsGenerator,
      firstParameterFormItemGenerator: this.firstParameterFormItemGenerator,
      secondParameterFormItemGenerator: this.secondParameterFormItemGenerator,
      type: "full",
      wrapperStyle: {
        alignItems: "start",
        display: "grid",
        gridColumnGap: offset,
        gridTemplateColumns: "max-content minmax(0px, 1fr) minmax(0px, 135px) minmax(0px, 1fr)"
      },
    });
  }

  @autobind
  private filterPropsGenerator(values: IMetaSettingTableRowColorRowElement): IFilterProps {
    const firstColumnInfo = values.firstColumnInfoId && this.props.columnInfos.find(columnInfo => columnInfo.id === values.firstColumnInfoId);
    const filterType = firstColumnInfo && getFilterType(firstColumnInfo, values.action) || undefined;

    return {
      actions: getActions(filterType, values.constant),
      filterType
    }
  }

  @autobind
  private firstParameterFormItemGenerator(values: IMetaSettingTableRowColorRowElement): JSX.Element {
    return this.generateColumnInfoSelect(
      "first",
      values.constant
        ? ((): void => this.resetFields("simpleFilter"))
        : undefined
    );
  }

  @autobind
  private generateColumnInfoSelect(
    prefix: string,
    onChange?: (value: ColumnInfo["id"]) => void
  ): JSX.Element {
    return (
      <Form.Item style={{marginBottom: 0}}>
        {this.props.form.getFieldDecorator(this.getDecoratorName(`${prefix}ColumnInfoId`))(
          <Select
            style={{width: "100%"}}
            placeholder="Выберите параметр"
            onChange={onChange}
          >
            {this.props.columnInfos.map(columnInfo => (
              <Select.Option key={columnInfo.id} value={columnInfo.id}>
                {columnInfo.getNameOrColumnName()}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    );
  }

  @autobind
  private secondParameterFormItemGenerator(): JSX.Element {
    return this.generateColumnInfoSelect("second");
  }

}
