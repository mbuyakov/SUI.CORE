/* eslint-disable @typescript-eslint/no-explicit-any */
import {IObjectWithIndex} from '@sui/ui-old-core';
import {Table, TableProps} from 'antd';
import autobind from 'autobind-decorator';
import update from 'immutability-helper';
import * as React from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import {DndProvider} from "./react18dndfix";
import HTML5Backend from 'react-dnd-html5-backend';

import {ExtractProps} from './other';
import {WaitData} from './WaitData';

let dragingIndex = -1;

class BodyRow extends React.Component<any> {
  public render(): JSX.Element {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      moveRow,
      ...restProps
    } = this.props;

    const style = {...restProps.style, cursor: 'move'};

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

class DraggableRowTableClass<T extends IObjectWithIndex> extends React.Component<Omit<TableProps<T>, 'onRow'> & {
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
    this.setState({data: nextProps.dataSource});
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
    const {data} = this.state;
    const dragRow = data[dragIndex];
    const newState = update(this.state, {
      data: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
      },
    });
    this.setState({loading: true});
    this.props.onOrderChanged(newState.data)
      .then((): void => this.setState({...newState, loading: false}));
  }

  @autobind
  private onRow(_: any, index: any): any {
    return {
      index,
      moveRow: this.moveRow,
    };
  }
}

export class DraggableRowTable<T> extends React.Component<ExtractProps<DraggableRowTableClass<T>> & {
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
