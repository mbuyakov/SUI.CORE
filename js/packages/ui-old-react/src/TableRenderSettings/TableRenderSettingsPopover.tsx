/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
import {ExperimentOutlined, WarningTwoTone} from "@ant-design/icons";
import {chain, ITableInfo} from "@sui/ui-old-core";
import {Button, Popover, Select, Tooltip} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import * as React from "react";

// noinspection ES6PreferShortImport
import {PromisedButton} from "../Inputs";
// noinspection ES6PreferShortImport
import {SUI_AUTO_WIDTH, SUI_ROW_CONTAINER, SUI_ROW_GROW_LEFT} from "../styles";

import {TableRenderSettingsPluginManager} from "./TableRenderSettingsPluginManager";
import {sleep} from "@sui/util-chore";

const popoverContentStyle: React.CSSProperties = {
  alignItems: "center",
  display: "grid",
  gridGap: 5,
  gridTemplateColumns: "auto 1fr",
};

export type ITableRenderParams<T extends {} = {}> = Omit<T, "renderType"> & {
  renderType?: string;
  [index: string]: any;
};

export interface ITableRenderSettingsPopoverProps {
  // eslint-disable-next-line react/no-unused-prop-types
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
}

export class TableRenderSettingsPopover<T> extends React.Component<ITableRenderSettingsPopoverProps, ITableRenderSettingsPopoverState<T>> {

  public static getDerivedStateFromProps(props: ITableRenderSettingsPopoverProps, state: ITableRenderSettingsPopoverState<{}>): ITableRenderSettingsPopoverState<{}> {
    const tableRenderParams: ITableRenderParams = TableRenderSettingsPopover.parseTableRenderParams(props.tableRenderParams);

    return {...state, tableRenderParams: {...tableRenderParams, ...state.tableRenderParams}};
  }

  public static parseTableRenderParams(params: string): ITableRenderParams {
    let tableRenderParams: ITableRenderParams = {};

    try {
      tableRenderParams = chain<ITableRenderParams<any>, string>(
        params,
        trp => JSON.parse(trp ? trp.replace(/\\"/g, "\"") : "{}"),
        ...Array.from(TableRenderSettingsPluginManager.plugins.values()).map(plugin => plugin.parseParams),
      );
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
    this.setState({popoverVisible: value});
  }


  @autobind
  public openPopover(): void {
    this.setState({popoverVisible: true});
  }

  public render(): JSX.Element {
    // console.log(this.props.tableRenderParams, this.state.tableRenderParams, typeof this.state.tableRenderParams.color === "boolean");
    const plugin = this.state.tableRenderParams.renderType && TableRenderSettingsPluginManager.plugins.get(this.state.tableRenderParams.renderType);

    return (
      <div className={SUI_ROW_GROW_LEFT}>
        <Select
          value={this.state.tableRenderParams.renderType || "raw"}
          onChange={this.updateField("renderType", true)}
          getPopupContainer={this.props.getPopupContainer}
        >
          {
            Array.from(TableRenderSettingsPluginManager.plugins.values())
              .filter(curPlugin => !curPlugin.hidden)
              .map(curPlugin => (<Select.Option key={curPlugin.id} value={curPlugin.id}>{curPlugin.title}</Select.Option>))
          }
        </Select>
        {plugin && plugin.hasSettings && (
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
                  style={{width: "100%"}}
                  promise={(): Promise<void> => this.props.promise(JSON.stringify(this.state.tableRenderParams).replace(/"/g, "\\\""))}
                  type="primary"
                  disabled={!this.state.changed}
                >
                  Сохранить
                </PromisedButton>
              </div>}
          >
            <Button
              icon={<ExperimentOutlined/>}
              onClick={this.openPopover}
            />
          </Popover>
        )}
      </div>
    );
  }

  @autobind
  public updateField(field: string, save: boolean = false): (value: any) => Promise<any> {
    return (value): Promise<any> => {
      const tableRenderParams = this.state.tableRenderParams;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tableRenderParams[field] = value;
      this.setState({tableRenderParams: {...tableRenderParams}, changed: true});

      return save ? this.props.promise(JSON.stringify(tableRenderParams).replace(/"/g, "\\\"")) : sleep(Number.MAX_VALUE);
    };
  }

  @autobind
  private getPopoverContent(type: string): React.ReactNode {
    const plugin = TableRenderSettingsPluginManager.plugins.get(type);
    return (
      <div style={popoverContentStyle}>
        {plugin ? plugin.getSettingsPopoverContent(this) : (
          <Tooltip
            title="Неизвестный плагин"
          >
            <WarningTwoTone
              style={{transform: "scale(1.5)"}}
              twoToneColor="#ad4e00"
            />
          </Tooltip>
        )}
      </div>
    );
  }

}
