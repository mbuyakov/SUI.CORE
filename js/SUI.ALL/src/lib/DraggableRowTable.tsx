/* tslint:disable:no-any */
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import autobind from 'autobind-decorator';
import update from 'immutability-helper';
import * as React from 'react';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { Omit } from './other';
import { WaitData } from './WaitData';

let dragingIndex = -1;

class BodyRow extends React.Component<any> {
  public render(): JSX.Element {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      ...restProps
    } = this.props;

    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />,
      ),
    );
  }
}

const rowSource = {
  beginDrag(props: any): any {
    dragingIndex = props.index;

    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props: any, monitor: any): any {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

// tslint:disable-next-line:variable-name
const DragableBodyRow = DropTarget(
  'row',
  rowTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }),
)(
  DragSource(
    'row',
    rowSource,
    (connect) => ({
      connectDragSource: connect.dragSource(),
    }),
  )(BodyRow),
);

// tslint:disable-next-line:max-classes-per-file
class DraggableRowTableClass<T> extends React.Component<Omit<TableProps<T>, 'onRow'> & {
  onOrderChanged(sortedDataSource: T[]): Promise<any>
}, {
  data: T[],
  loading?: boolean
}> {
  public constructor(props: any) {
    super(props);
    this.state = {
      data: props.dataSource,
    };
  }

  @autobind
  public componentWillReceiveProps(nextProps: any): void {
    // // console.log(nextProps);
    this.setState({ data: nextProps.dataSource });
  }

  public render(): JSX.Element {
    return (
      <WaitData
        delay={0}
        data={!this.state.loading}
        alwaysUpdate={true}
        hideChildren={false}
      >
        <Table
          {...this.props}
          dataSource={this.state.data}
          components={{
            body: {
              row: DragableBodyRow,
            },
          }}
          onRow={this.onRow}
        />
      </WaitData>
    );
  }

  @autobind
  private moveRow(dragIndex: any, hoverIndex: any): any {
    const { data } = this.state;
    const dragRow = data[dragIndex];
    const newState = update(this.state, {
      data: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
      },
    });
    this.setState({ loading: true });
    // tslint:disable-next-line:no-floating-promises
    this.props.onOrderChanged(newState.data)
      .then(_ => this.setState({ ...newState, loading: false }));
  }

  @autobind
  private onRow(_: any, index: any): any {
    return {
      index,
      moveRow: this.moveRow,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class DraggableRowTable<T> extends React.Component<Pick<TableProps<any>, "loading" | "footer" | "style" | "title" | "scroll" | "size" | "children" | "className" | "prefixCls" | "locale" | "getPopupContainer" | "onChange" | "dataSource" | "expandIcon" | "tableLayout" | "columns" | "bordered" | "bodyStyle" | "pagination" | "rowKey" | "dropdownPrefixCls" | "rowSelection" | "components" | "rowClassName" | "expandedRowRender" | "defaultExpandAllRows" | "defaultExpandedRowKeys" | "expandedRowKeys" | "expandIconAsCell" | "expandIconColumnIndex" | "expandRowByClick" | "onExpandedRowsChange" | "onExpand" | "indentSize" | "onRowClick" /*| "onRow" */| "onHeaderRow" | "useFixedHeader" | "showHeader" | "childrenColumnName" | "sortDirections"> & {
  onOrderChanged(sortedDataSource: T[]): Promise<any>
}> {
  public render(): JSX.Element {
    return (
      <DndProvider backend={HTML5Backend}>
        <DraggableRowTableClass<T> {...this.props as any} />
      </DndProvider>
    );
  }
}
