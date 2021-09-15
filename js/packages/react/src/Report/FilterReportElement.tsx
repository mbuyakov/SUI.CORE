/* eslint-disable @typescript-eslint/ban-types */
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import {Popover, PopoverProps} from 'antd';
import autobind from "autobind-decorator";
import React from "react";

// noinspection ES6PreferShortImport
import {errorNotification} from "../drawUtils";
// noinspection ES6PreferShortImport
import {ExtractProps} from "../other";
// noinspection ES6PreferShortImport
import {FRE_WITH_HEADER_FILTER_BUTTON, FRE_WITHOUT_HEADER_FILTER_BUTTON} from "../styles";
// noinspection ES6PreferShortImport
import {WaitData} from "../WaitData";

import {ReportElement} from "./ReportElement";

export type FilterChangeHandler<T extends {}> = (filter: T) => void;

export interface IFilterReportElementProps<TData, TFilter>
  extends Omit<ExtractProps<ReportElement>, "children"> {
  initialFilter: TFilter;
  popoverProps?: Omit<PopoverProps, "children" | "content" | "trigger">;

  children(data: TData, filter: TFilter): JSX.Element;

  fetchData(filter: TFilter): Promise<TData>;

  popoverContent(filter: TFilter, filterChangeHandler: FilterChangeHandler<TFilter>): JSX.Element;
}

export interface IFilterReportElementState<TData, TFilter> {
  data?: TData;
  filter: TFilter;
  lastFetchedFilter: TFilter;
  loading: boolean;
  popoverOpened: boolean;
}

export class FilterReportElement<TData, TFilter = {}>
  extends React.Component<IFilterReportElementProps<TData, TFilter>, IFilterReportElementState<TData, TFilter>> {

  public constructor(props: IFilterReportElementProps<TData, TFilter>) {
    super(props);
    this.state = {
      filter: this.props.initialFilter,
      lastFetchedFilter: this.props.initialFilter,
      loading: false,
      popoverOpened: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    this.setState({data: await this.props.fetchData(this.state.filter)});
  }

  public render(): JSX.Element {
    const {children, ...restProps} = this.props;
    const {data, filter, lastFetchedFilter, loading, popoverOpened} = this.state;

    const hasHeader = !!restProps.header;

    const hasHeaderDynamicProps = {
      filterButtonClassName: hasHeader ? FRE_WITH_HEADER_FILTER_BUTTON : FRE_WITHOUT_HEADER_FILTER_BUTTON
    };

    const filterButton = (
      <Popover
        placement="topRight"
        {...restProps.popoverProps}
        trigger="click"
        visible={popoverOpened}
        content={restProps.popoverContent(filter, this.filterChangeHandler)}
        onVisibleChange={this.onPopoverVisibleChange}
      >
        <IconButton
          onClick={this.onClick}
          disabled={!!this.state.loading}
          className={hasHeaderDynamicProps.filterButtonClassName}
          size="small"
        >
          <SettingsIcon/>
        </IconButton>
      </Popover>
    );

    return (
      <ReportElement
        {...restProps}
        header={hasHeader && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr max-content"
            }}
          >
            <>{restProps.header}</>
            {filterButton}
          </div>
        )}
      >
        <>
          <WaitData
            data={data}
            spinning={loading}
            alwaysUpdate={true}
            disableUnwrapOnReady={true}
          >
            {(): JSX.Element => children(data, lastFetchedFilter)}
          </WaitData>
          {!hasHeader && (
            <span
              style={{
                position: "absolute",
                right: 0,
                top: 0
              }}
            >
              {filterButton}
            </span>
          )}
        </>
      </ReportElement>
    );
  }

  @autobind
  private onClick(): void {
    this.setState({popoverOpened: !this.state.popoverOpened});
  }

  @autobind
  private filterChangeHandler(filter: TFilter): void {
    this.setState({filter});
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
    this.onClick();
  }

}
