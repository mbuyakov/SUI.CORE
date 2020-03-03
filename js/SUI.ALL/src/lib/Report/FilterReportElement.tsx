import { Icon } from '@ant-design/compatible';
import {Button, Popover} from 'antd';
import {PopoverProps} from "antd/lib/popover";
import autobind from "autobind-decorator";
import React from "react";

import {errorNotification} from "../drawUtils";
import {ExtractProps} from "../other";
import {WaitData} from "../WaitData";

import {ReportElement} from "./ReportElement";

// tslint:disable-next-line:no-any
export type onChangeFn<T> = (property: keyof T) => (value: any) => void;

export interface IFilterReportElementProps<TData, TFilter>
  extends Omit<ExtractProps<ReportElement>, "children"> {
  initialFilter: TFilter;
  popoverProps?: Omit<PopoverProps, "children" | "content" | "trigger">;
  children(data: TData, filter: TFilter): JSX.Element;
  fetchData(filter: TFilter): Promise<TData>;
  popoverContent(filter: TFilter, onChangeFn: onChangeFn<TFilter>): JSX.Element;
}

export interface IFilterReportElementState<TData, TFilter> {
  data?: TData;
  filter: TFilter;
  lastFetchedFilter: TFilter;
  loading: boolean;
}

export class FilterReportElement<TData, TFilter = {}>
  extends React.Component<IFilterReportElementProps<TData, TFilter>, IFilterReportElementState<TData, TFilter>> {

  public constructor(props: IFilterReportElementProps<TData, TFilter>) {
    super(props);
    this.state = {
      filter: this.props.initialFilter,
      lastFetchedFilter: this.props.initialFilter,
      loading: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    this.setState({data: await this.props.fetchData(this.state.filter)});
  }

  public render(): JSX.Element {
    const {children, ...restProps} = this.props;
    const {data, filter, loading} = this.state;

    return (
      <ReportElement
        {...restProps}
        header={(
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr max-content"
            }}
          >
            <>{restProps.header}</>
            <Popover
              placement="topRight"
              {...restProps.popoverProps}
              trigger="click"
              content={restProps.popoverContent(filter, this.onFilterChangeFn)}
              onVisibleChange={this.onPopoverVisibleChange}
            >
              <Button
                icon={<Icon type={"setting"}/>}
                size="small"
                disabled={!!this.state.loading}
              />
            </Popover>
          </div>
        )}
      >
        <WaitData
          data={data}
          spinning={loading}
          alwaysUpdate={true}
          disableUnwrapOnReady={true}
        >
          {children(data, filter)}
        </WaitData>
      </ReportElement>
    );
  }

  @autobind
  // tslint:disable-next-line:no-any
  private onFilterChangeFn(property: keyof TFilter): (value: any) => void {
    return (value): void => this.setState({
      filter: {
        ...this.state.filter,
        [property]: value
      }
    })
  }

  @autobind
  private async onPopoverVisibleChange(visible: boolean): Promise<void> {
    const {
      filter,
      lastFetchedFilter
    } = this.state;

    // !visible - onClose
    if (!visible && JSON.stringify(filter) !== JSON.stringify(lastFetchedFilter)) {
      this.setState({
        lastFetchedFilter: filter,
        loading: true
      });

      await this.props.fetchData(filter)
        .then(data => this.setState({data}))
        .catch(reason => {
          errorNotification(
            "Ошибка при обновлении",
            "Подробности в консоли Вашего браузера"
          );
          console.error(reason);
          this.setState({lastFetchedFilter});
        })
        .finally(() => this.setState({loading: false}));
    }

    if (this.props.popoverProps && this.props.popoverProps.onVisibleChange) {
      this.props.popoverProps.onVisibleChange(visible);
    }
  }

}
