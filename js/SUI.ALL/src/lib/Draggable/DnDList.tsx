import { Icon } from '@ant-design/compatible';
import {Dropdown, Menu} from "antd";
import Button from "antd/lib/button";
import {MenuItemProps} from "antd/lib/menu/MenuItem";
import autobind from "autobind-decorator";
import * as React from "react";
import {Container, ContainerOptions, Draggable, DropResult} from "react-smooth-dnd";
import uuidv4 from "uuid/v4";

import {DeletableSmallCard} from "../DeletableSmallCard";
import { Rendered } from '../other';
import { unCapitalize } from '../stringFormatters';
import {DND_LIST__COLS, DND_LIST__PLUS_BTN, DND_LIST__ROWS, DND_LIST__SCROLL_SEMI_PADDING} from "../styles";
import {applyDrag} from "../utils";

import {DnDChild, IBaseDnDChildProps} from "./DnDChild";


export type Direction = 'vertical' | 'horizontal'

export interface IDnDListProps<T extends React.Component> extends IBaseDnDChildProps {
  addButtons?: Array<React.ReactElement<MenuItemProps>>
  behaviour?: 'move' | 'copy' | 'drop-zone' | 'contain'
  deletableChildren?: boolean
  direction?: Direction
  extra?: React.ReactNode
  initialItems?: Array<Rendered<T>>
  noCard?: boolean
  style?: React.CSSProperties
  title?: string
  type: string

shouldAcceptDrop?(sourceContainerOptions: ContainerOptions, payload: any): boolean;
}

export interface IDnDListState<T extends React.Component> {
  itemRefs: Map<string, T>
  items: Array<Rendered<T>>
}

export class DnDList<T extends DnDChild> extends DnDChild<IDnDListProps<T>, IDnDListState<T>> {

  public constructor(props: IDnDListProps<T> & { id: string }) {
    super(props);

    if (!this.state) {
      let items: IDnDListState<T>["items"] = [];
      if (this.props.initialItems) {
        items = this.props.initialItems.map(this.__internalProcessItem);
      }

      this.state = {
        itemRefs: new Map<string, T>(),
        items
      };
    }
  }

  @autobind
  public addItem(item: Rendered<T>): void {
    this.setState({items: [...this.state.items, this.__internalProcessItem(item)]});
  }

  @autobind
  public getChildRefs(): T[] {
    // // console.log(this.state);
    // Sort map keys as items
    return this.state.items.map(item => this.state.itemRefs.get(item.props.id))
  }

  @autobind
  public onDelete(id: string): void {
    const items = this.state.items.filter(item => item.props.id !== id);
    this.setState({items});
  }

  @autobind
  public onDrop(dropResult: DropResult): void {
    this.setState({items: applyDrag(this.state.items, dropResult, this.__internalProcessItem)});
  }

  public render(): JSX.Element {
    const card = !this.props.noCard;
    const direction = this.props.direction || "vertical";
    const hasAddButton = this.props.addButtons && this.props.addButtons.length > 0;

    let container = (
      <Container
        groupName={this.props.type}
        onDrop={this.onDrop}
        orientation={direction}
        getChildPayload={this.getChildPayload}
        behaviour={this.props.behaviour}
        shouldAcceptDrop={this.props.shouldAcceptDrop}
        dragHandleSelector=".dragHandle"
      >
        {this.state.items
          .map(item => (
            <Draggable key={item.props.id}>
              {item}
            </Draggable>
          ))}
      </Container>
    );
    if (direction === 'horizontal') {
      container = (
        <div className={DND_LIST__SCROLL_SEMI_PADDING}>
          {container}
        </div>
      );
    }

    // noinspection RequiredAttributes
    return (card
        ? (
          <DeletableSmallCard
            onDelete={this.props.onDelete}
            draggable={this.props.draggable}
            className={direction === 'vertical' ? DND_LIST__ROWS : DND_LIST__COLS}
            title={this.props.title}
            extra={this.props.extra}
            bodyStyle={!hasAddButton ? ({gridGap: 0}) : {}}
            style={this.props.style}
          >
            {container}
            {hasAddButton && (
              <div>
                {direction === 'vertical' && this.props.addButtons.length === 1
                  ? <Button
                    href={null}
                    type="dashed"
                    block={direction === 'vertical'}
                    onClick={this.props.addButtons[0].props.onClick as () => void}
                  >
                    {`Добавить ${unCapitalize(this.props.addButtons[0].props.children as string)}`}
                  </Button>
                  : <Dropdown
                    overlay={<Menu>
                      {this.props.addButtons}
                    </Menu>}
                  >
                    <Button
                      href={null}
                      className={DND_LIST__PLUS_BTN}
                      type="dashed"
                      block={direction === 'vertical'}
                      icon={<Icon type={direction === 'horizontal' ? "plus" : null}/>}
                    >
                      {direction === 'vertical' && "Добавить"}
                    </Button>
                  </Dropdown>
                }
              </div>
            )}
          </DeletableSmallCard>
        )
        : container
    );
  }

  @autobind
  private __internalProcessItem(item: Rendered<T>): Rendered<T> {
    let id = item.props.id;
if (id == null) {
      id = uuidv4();
    }

    let onDelete = item.props.onDelete;
    if (this.props.deletableChildren) {
      onDelete = () => this.onDelete(id);
    }

    return React.cloneElement(item, {...item.props, ref: this.getRefCallback(id), draggable: true, id, onDelete});
  }

  @autobind
  private getChildPayload(i: number): Rendered<T> {
    // DnDChild hook
    const item = this.state.items[i];
    const ref = this.state.itemRefs.get(item.props.id);
    ref.saveState();

    return item;
  }

  @autobind
  private getRefCallback(id: string): (ref: T) => void {
    return ref => {
      // // console.log(ref, typeof ref);
      if (ref === null) {
        // Ignore
        // Warning!! Memory leak?
        return;
      }
      this.state.itemRefs.set(id, ref);
    }
  }
}
