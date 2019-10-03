/* tslint:disable:jsx-no-lambda no-any */
import {Card, Form, Input} from "antd";
import {WrappedFormUtils} from "antd/lib/form/Form";
import autobind from 'autobind-decorator';
import moment from "moment";
import * as React from "react";

import {ColumnInfo, ColumnInfoManager, TableInfo} from "../cache";
import { DnfForm, IDnfFormRowElementProps, IMetaSettingTableRowColorRowElement, IResultDnfFormValues, MetaSettingTableRowColorRowComponent } from '../Dnf';
import { generateUpdate } from '../gql/queryGenerator';
import { formatRawForGraphQL } from '../stringFormatters';
import { FilterType, getFilterType } from '../utils';
import { WaitData } from '../WaitData';

interface IAdditionalTabProps {
  columnInfos: ColumnInfo[];
  tableInfo: TableInfo;
}

export interface IMetaSettingTableRowColorFormValues extends IResultDnfFormValues<IMetaSettingTableRowColorRowElement> {
  color: string;
}

interface IAdditionalTabState {
  colorSettings?: IMetaSettingTableRowColorFormValues;
  ready?: boolean;
}

export class AdditionalTab extends React.Component<IAdditionalTabProps, IAdditionalTabState> {

  public constructor(props: IAdditionalTabProps) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    let colorSettings: IMetaSettingTableRowColorFormValues | null = null;

    if (this.props.tableInfo.colorSettings) {
      colorSettings = JSON.parse(this.props.tableInfo.colorSettings);
      for (const element of colorSettings.forms.flatMap(form => form)) {
        if (element.constant && element.simpleFilter) {
          const filterType = getFilterType(await ColumnInfoManager.getById(element.firstColumnInfoId), element.action);
          if ([FilterType.DATE, FilterType.TIMESTAMP].includes(filterType)) {
            element.simpleFilter = moment(element.simpleFilter);
          }
        }
      }
    }

    this.setState({
      colorSettings,
      ready: true
    });
  }

  public render(): JSX.Element {
    return (
      <Card
        type="inner"
        title="Покраска строк таблицы"
      >
        <WaitData
          data={this.state.ready}
        >
          {() => (
            <DnfForm
              additionalFormItems={this.additionalFormItems}
              allowClear={true}
              buttonAlignment="start"
              disableRowSwap={true}
              onSubmit={colorSettings => generateUpdate(
                'tableInfo',
                this.props.tableInfo.id,
                'colorSettings',
                formatRawForGraphQL(JSON.stringify(colorSettings))
              )}
              initialState={this.state.colorSettings}
              rowComponent={this.rowComponent}
              wrapperStyle={{ width: '100%' }}
            />
          )}
        </WaitData>
      </Card>
    );
  }

  @autobind
  // tslint:disable-next-line:prefer-function-over-method
  private additionalFormItems(form: WrappedFormUtils): JSX.Element {
    return (
      <Form.Item style={{marginBottom: 0}}>
        {form.getFieldDecorator("color")(
          <Input placeholder="Введите цвет (#ffffff)"/>
        )}
      </Form.Item>
    );
  }

  @autobind
  private rowComponent(props: IDnfFormRowElementProps<IMetaSettingTableRowColorRowElement>): JSX.Element {
    return (
      // TODO: as any костыль до объединения проектов
      <MetaSettingTableRowColorRowComponent
        key={props.id.toString()}
        columnInfos={this.props.columnInfos as any}
        {...props}
      />
    );
  }

}
