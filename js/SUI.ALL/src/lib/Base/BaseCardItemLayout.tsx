import { Tooltip } from 'antd';
import Icon from 'antd/lib/icon';
import * as React from 'react';

import { BaseTable, IBaseTableProps } from '../BaseTable';
import { NO_DATA_TEXT } from '../const';
import { DataKey, getDataByKey } from '../dataKey';
import { BASE_CARD_ITEM_LABEL_HORIZONTAL } from '../styles';
import { defaultIfNotBoolean } from '../typeWrappers';

// tslint:disable-next-line:no-any
export type CardItemRender<T> = (value: any, item: T) => JSX.Element | string;

export type IBaseCardDescItemLayout<T> = Omit<IBaseCardItemLayout<T>, 'tableProps'>;

export interface IBaseCardItemLayout<T> {
  dataKey?: DataKey;
  render?: CardItemRender<T>;
  required?: boolean;
  tableProps?: Omit<IBaseTableProps, 'rows'>;
  title?: React.ReactNode;
}

interface ICustomRenderProps<T> {
  item: T
  render: CardItemRender<T>;
  // tslint:disable-next-line:no-any
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

// tslint:disable-next-line:no-any
export function renderIBaseCardItem<T>(sourceItem: any, item: IBaseCardItemLayout<T> | IBaseCardDescItemLayout<T>): React.ReactNode {
  // console.log(item);
  const required = defaultIfNotBoolean(item.required, true);
  let data = (item.dataKey !== null && item.dataKey !== undefined) && getDataByKey(sourceItem, item.dataKey);

  if (item.render) {
    data = <CustomRender item={sourceItem} render={item.render} value={data}/>;
  } else if ((item as IBaseCardItemLayout<T>).tableProps) {
    data = (
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      <BaseTable
        cardType="inner"
        paperStyle={{ margin: 0 }}
        {...(item as IBaseCardItemLayout<T>).tableProps}
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

  const title = item.title && (
    <span className={BASE_CARD_ITEM_LABEL_HORIZONTAL}>
      {item.title}:
    </span>
  );

  data = (
    <>
      {title}
      {data}
    </>
  );

  return data;
}

