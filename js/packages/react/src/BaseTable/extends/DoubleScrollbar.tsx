import autobind from "autobind-decorator";
import * as React from 'react';

interface IDoubleScrollbarState {
  width: React.CSSProperties["width"];
}

// fixed https://github.com/umchee/react-double-scrollbar/blob/master/src/DoubleScrollbar.jsx
export class DoubleScrollbar extends React.Component<{}, IDoubleScrollbarState> {

  private childrenWrapper: React.RefObject<HTMLDivElement> = React.createRef();
  private outerDiv: React.RefObject<HTMLDivElement> = React.createRef();

  public constructor() {
    super({});
    this.state = {width: "auto"}
  }

  public componentDidMount(): void {
    const outerDiv = this.outerDiv.current;
    const childWrapper = this.childrenWrapper.current;

    // Set initial width
    this.calculateWidth();

    // Update width when window size changes
    window.addEventListener("resize", this.calculateWidth);

    // assoc the scrolls
    outerDiv.onscroll = function () {
      childWrapper.scrollLeft = outerDiv.scrollLeft;
    };

    childWrapper.onscroll = function () {
      outerDiv.scrollLeft = childWrapper.scrollLeft;
    };
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.calculateWidth);
  }

  public componentDidUpdate(): void {
    this.calculateWidth();
  }

  public render(): JSX.Element {
    let outerDivStyle: React.CSSProperties = {marginTop: -1, overflowX: "auto", overflowY: "hidden"};
    let innerDivStyle: React.CSSProperties = {height: 1, width: this.state.width};
    let childDivStyle: React.CSSProperties = {overflow: "auto", overflowY: "hidden"};

    return (
      <div>
        <div ref={this.outerDiv} style={outerDivStyle}>
          <div style={innerDivStyle}>&nbsp;</div>
        </div>
        <div ref={this.childrenWrapper} style={childDivStyle}>
          {this.props.children}
        </div>
      </div>
    );
  }

  @autobind
  private calculateWidth(): void {
    const width = this.getChildWrapperWidth() || "auto";

    // Set the width of the inner div to the first child's
    const widthNumber = Number(width.toString().replace("px", ""));
    const stateWidthNumber = Number(width.toString().replace("px", ""));
    if ((!isNaN(widthNumber) && !isNaN(stateWidthNumber)) ? (Math.abs(widthNumber - stateWidthNumber) > 5) : (width !== this.state.width)) {
      this.setState({width});
    }
  }

  @autobind
  private getChildWrapperWidth(): React.CSSProperties["width"] {
    let width = null;

    if (this.childrenWrapper.current && this.childrenWrapper.current.scrollWidth) {
      width = `${this.childrenWrapper.current.scrollWidth}px`;
    }

    return width;
  }

}
