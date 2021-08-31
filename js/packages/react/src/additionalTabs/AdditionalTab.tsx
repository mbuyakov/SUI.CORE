import {formatRawForGraphQL, generateUpdate, TableInfo} from '@sui/core';
import {Card, Space} from "antd";
import Input from "antd/lib/input";
import autobind from 'autobind-decorator';
import * as React from "react";
import {ChangeEvent} from "react";
import {PromisedButton} from '@/Inputs';

interface IAdditionalTabProps {
  tableInfo: TableInfo;
}

interface IAdditionalTabState {
  value?: string;
}

export class AdditionalTab extends React.Component<IAdditionalTabProps, IAdditionalTabState> {

  public constructor(props: IAdditionalTabProps) {
    super(props);
    this.state = {value: props.tableInfo.colorSettings ? JSON.parse(props.tableInfo.colorSettings)?.expression : null};
  }

  public render(): JSX.Element {
    return (
      <Card
        type="inner"
        title="Покраска строк таблицы"
        bodyStyle={{}}
      >
        <Space direction="vertical" style={{width: "100%"}}>
          <Input.TextArea
            {...this.props}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => this.setState({value: event.target.value})}
            value={this.state?.value}
            rows={4}
          />
          <PromisedButton
            type="primary"
            promise={this.save}
          >
            Сохранить
          </PromisedButton>
        </Space>
      </Card>
    );
  }

  @autobind
  private save(): Promise<void> {
    const expression = this.state?.value?.trim();

    return generateUpdate(
      'tableInfo',
      this.props.tableInfo.id,
      'colorSettings',
      expression ? formatRawForGraphQL(JSON.stringify({expression})) : null
    );
  }

}
