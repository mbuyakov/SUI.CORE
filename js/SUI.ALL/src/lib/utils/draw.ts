import * as React from "react";
import * as ReactDOM from 'react-dom';

export function draw(element: React.ReactElement, containerRef?: React.RefObject<any>): void {
  let elementContainer;

  elementContainer = containerRef && containerRef.current
    ? ReactDOM.findDOMNode(containerRef.current)
    : document.createElement('div');

// @ts-ignore
  ReactDOM.render(element, elementContainer);
}
