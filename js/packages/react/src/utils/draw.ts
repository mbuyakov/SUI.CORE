import * as React from "react";
import * as ReactDOM from 'react-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function draw(element: React.ReactElement, containerRef?: React.RefObject<any>): void {
  let elementContainer;

  elementContainer = containerRef && containerRef.current
    ? ReactDOM.findDOMNode(containerRef.current)
    : document.createElement('div');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ReactDOM.render(element, elementContainer);
}
