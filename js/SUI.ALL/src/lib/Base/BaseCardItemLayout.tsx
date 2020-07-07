import { Icon } from '@ant-design/compatible';
import { Tooltip } from 'antd';
import * as React from 'react';

import { BaseTable, IBaseTableProps } from '../BaseTable';
import { NO_DATA_TEXT } from '../const';
import { DataKey, getDataByKey } from '../dataKey';
import { defaultIfNotBoolean } from '../typeWrappers';

export type CardItemRender<T> = (value: any, item: T) => JSX.Element | string;

export interface IBaseCardItemLayout<T> {
  dataKey?: DataKey;
  dataVerticalAlign?: "baseline" | "bottom" | "middle" | "sub" | "super" | "text-bottom" | "text-top" | "top";
  render?: CardItemRender<T>;
  required?: boolean;
  tableProps?: Omit<IBaseTableProps, 'rows'>;
  title?: React.ReactNode;
  titleVerticalAlign?: "baseline" | "bottom" | "middle" | "sub" | "super" | "text-bottom" | "text-top" | "top";
}

interface ICustomRenderProps<T> {
  item: T
  render: CardItemRender<T>;
  value: any;
}

class CustomRender<T> extends React.Component<ICustomRenderProps<T>, {
  error?: boolean;
}> {
  public constructor(props: ICustomRenderProps<T>) {
    super(props);
    this.state = {};
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(error);
    console.error(errorInfo);
    this.setState({ error: true });
  }

  public render(): React.ReactNode {
    if (this.state.error) {
      return (
        <Tooltip title="Произошла ошибка при рендере компонента">
          <Icon
            type="warning"
            theme="twoTone"
            twoToneColor="#cf1322"
            style={{ fontSize: 20 }}
          />
        </Tooltip>
      );
    }
    try {
      return this.props.render(this.props.value, this.props.item);
    } catch (e) {
      console.error(e);
      this.setState({ error: true });

      return null;
    }
  }
}

export const DEFAULT_ITEM_RENDERER = renderIBaseCardItem;

export function renderIBaseCardItem<T>(sourceItem: any, item: IBaseCardItemLayout<T>, colspan: number): React.ReactNode {
  // console.log(item);
  const required = defaultIfNotBoolean(item.required, true);
  let data = (item.dataKey !== null && item.dataKey !== undefined) && getDataByKey(sourceItem, item.dataKey);

  if (item.render) {
    data = <CustomRender item={sourceItem} render={item.render} value={data}/>;
  } else if (item.tableProps) {
    data = (
      // @ts-ignore
      <BaseTable
        cardType="inner"
        paperStyle={{ margin: 0 }}
        {...(item.tableProps)}
        rows={data}
      />
    );
  }

  // I hate JS
  if (data === 0) {
    data = '0';
  }

  if (typeof (data) === 'boolean') {
    data = data
      ? <Icon type="check" theme="outlined"/>
      : <Icon type="close" theme="outlined"/>;
  }

  if (data === null || data === undefined) {
    if (!required) {
      return null;
    }
    data = NO_DATA_TEXT;
  }

  const title = item.title && `${item.title as string}: `;

  data = (
    <>
      {title && <td style={{verticalAlign: item.titleVerticalAlign, paddingRight: 12, color: "rgba(121, 119, 119, 0.65)", wordWrap: "break-word", paddingBottom: 8}}>{title}</td>}
      <td colSpan={(title ? 1 : 2) + ((colspan - 1) * 2)} style={{verticalAlign: item.dataVerticalAlign, paddingBottom: 8}}>{data}</td>
    </>
  );

  return data;
}

