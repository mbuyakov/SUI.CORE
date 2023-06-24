import {Container as _Container, Draggable as _Draggable} from "react-smooth-dnd";
import React, {CSSProperties, PropsWithChildren} from "react";
import {DraggableProps} from "react-smooth-dnd/dist/src/Draggable";
import {ContainerOptions} from "smooth-dnd";

interface ContainerProps extends ContainerOptions {
  render?: (rootRef: React.RefObject<any>) => React.ReactElement;
  style?: CSSProperties;
}

export const Container = _Container as unknown as React.FC<PropsWithChildren<ContainerProps>>;
export const Draggable = _Draggable as unknown as React.FC<PropsWithChildren<DraggableProps>>;

