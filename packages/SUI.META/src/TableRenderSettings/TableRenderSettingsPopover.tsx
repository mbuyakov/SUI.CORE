/* tslint:disable:jsx-no-lambda */
import { chain, sleep, SUI_ROW_CONTAINER, SUI_ROW_GROW_LEFT } from '@smsoft/sui-core';
import { PromisedButton } from '@smsoft/sui-promised';
import { Popover } from 'antd';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { SUI_AUTO_WIDTH } from '../styles';
import { ITableInfo } from '../types';

import { TableRenderSettingsPluginManager } from './TableRenderSettingsPluginManager';

const popoverContentStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'grid',
  gridGap: 5,
  gridTemplateColumns: 'auto 1fr',
};

export type ITableRenderParams<T extends {} = {}> = Omit<T, 'renderType'> & {
  renderType?: string;
  // tslint:disable-next-line:no-any
  [index: string]: any;
}

export interface ITableRenderSettingsPopoverProps {
  tableInfo: ITableInfo;
  tableRenderParams?: string;

  getPopupContainer(): HTMLElement;

  promise(serializedTableRenderParams: string): Promise<void>;
}

export interface ITableRenderSettingsPopoverState<T> {
  changed?: boolean;
  popoverVisible?: boolean;
  savingInProcess?: boolean;
  selectOpened?: boolean;
  tableRenderParams: ITableRenderParams<T>;
  // tslint:disable-next-line:no-any
}

export class TableRenderSettingsPopover<T> extends React.Component<ITableRenderSettingsPopoverProps, ITableRenderSettingsPopoverState<T>> {

  public static getDerivedStateFromProps(props: ITableRenderSettingsPopoverProps, state: ITableRenderSettingsPopoverState<{}>): ITableRenderSettingsPopoverState<{}> {
    const tableRenderParams: ITableRenderParams = TableRenderSettingsPopover.parseTableRenderParams(props.tableRenderParams);

    return { ...state, tableRenderParams: { ...tableRenderParams, ...state.tableRenderParams } };
  }

  public static parseTableRenderParams(params: string): ITableRenderParams {
    let tableRenderParams: ITableRenderParams = {};

    try {
      // tslint:disable-next-line:no-any
      tableRenderParams = chain<ITableRenderParams<any>, string>(
        params,
        trp => JSON.parse(trp ? trp.replace(/\\"/g, '"') : '{}'),
        ...Array.from(TableRenderSettingsPluginManager.plugins.values()).map(plugin => plugin.parseParams),
      );
      // if (tableRenderParams.drillDownParamsData) {
      //   tableRenderParams.drillDownParamsData
      //     .filter(drillDownParam =>
      //       drillDownParam.actualityDate && drillDownParam.actualityDate[1] // [Moment, Moment]
      //     ).forEach(drillDownParam =>
      //     drillDownParam.actualityDate = drillDownParam
      //     // tslint:disable-next-line:no-unnecessary-callback-wrapper
      //       .actualityDate.map(date => moment(date)) as [Moment, Moment]
      //   );
      // }
    } catch (e) {
      // Ignore
      console.error(e);
    }

    return tableRenderParams;
  }

  private readonly saveButtonRef: React.RefObject<PromisedButton> = React.createRef<PromisedButton>();

  public constructor(props: ITableRenderSettingsPopoverProps) {
    super(props);
    this.state = {
      tableRenderParams: {} as ITableRenderParams<T>,
    };
  }

  @autobind
  public onPopoverVisibleChange(value: boolean): void {
    if (value) {
      // Ignore
      return;
    }
    this.setState({ popoverVisible: value });
  }


  @autobind
  public openPopover(): void {
    this.setState({ popoverVisible: true });
  }

  public render(): JSX.Element {
    // console.log(this.props.tableRenderParams, this.state.tableRenderParams, typeof this.state.tableRenderParams.color === "boolean");
    return (
      <div className={SUI_ROW_GROW_LEFT}>
        <Select
          value={this.state.tableRenderParams.renderType || 'raw'}
          onChange={this.updateField('renderType', true)}
          getPopupContainer={this.props.getPopupContainer}
        >
          {Array.from(TableRenderSettingsPluginManager.plugins.values()).map(plugin => (<Select.Option key={plugin.id}>{plugin.title}</Select.Option>))}
        </Select>
        {this.state.tableRenderParams.renderType && TableRenderSettingsPluginManager.plugins.get(this.state.tableRenderParams.renderType).hasSettings && (
          <Popover
            title="Настройка отображения"
            trigger="click"
            visible={this.state.popoverVisible}
            onVisibleChange={this.onPopoverVisibleChange}
            getPopupContainer={this.props.getPopupContainer}
            overlayClassName={SUI_AUTO_WIDTH}
            placement="left"
            content={
              <div className={SUI_ROW_CONTAINER}>
                {this.getPopoverContent(this.state.tableRenderParams.renderType)}
                <PromisedButton
                  ref={this.saveButtonRef}
                  style={{ width: '100%' }}
                  promise={() => this.props.promise(JSON.stringify(this.state.tableRenderParams).replace(/"/g, '\\"'))}
                  type="primary"
                  disabled={!this.state.changed}
                >
                  Сохранить
                </PromisedButton>
              </div>}
          >
            <Button
              icon="experiment"
              onClick={this.openPopover}
            />
          </Popover>
        )}
      </div>
    );
  }

  @autobind
  private getPopoverContent(type: string): React.ReactNode {
    const plugin = TableRenderSettingsPluginManager.plugins.get(type);

    return (
      <div style={popoverContentStyle}>
        {plugin.getSettingsPopoverContent(this)}
      </div>
    );
  }

  @autobind
  // tslint:disable-next-line:no-any
  private updateField(field: string, save: boolean = false): (value: any) => Promise<any> {
    return (async value => {
      // console.log(field, value);
      const tableRenderParams = this.state.tableRenderParams;
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      tableRenderParams[field] = value;
      this.setState({ tableRenderParams: { ...tableRenderParams }, changed: true });

      return save ? this.props.promise(JSON.stringify(tableRenderParams).replace(/"/g, '\\"')) : sleep(Number.MAX_VALUE);
    });
  }

}
