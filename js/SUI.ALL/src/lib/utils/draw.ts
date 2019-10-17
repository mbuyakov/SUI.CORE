import * as React from "react";
import * as ReactDOM from 'react-dom';

// tslint:disable-next-line:no-any
export function draw(element: React.ReactElement, containerRef?: React.RefObject<any>): void {
  let elementContainer;

  elementContainer = containerRef && containerRef.current
    ? ReactDOM.findDOMNode(containerRef.current)
    : document.createElement('div');

  // tslint:disable-next-line:ban-ts-ignore
  // @ts-ignore
  ReactDOM.render(element, elementContainer);
}
