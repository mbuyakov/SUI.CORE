import autobind from "autobind-decorator";
import * as React from "react";

// fixed https://github.com/umchee/react-double-scrollbar/blob/master/src/DoubleScrollbar.jsx
export class DoubleScrollbar extends React.Component<{children: React.ReactNode}> {

  private childrenWrapper: React.RefObject<HTMLDivElement> = React.createRef();
  private outerDiv: React.RefObject<HTMLDivElement> = React.createRef();

  public componentDidMount(): void {
    const outerDiv = this.outerDiv.current;
    const childWrapper = this.childrenWrapper.current;

    // Update width when window size changes
    window.addEventListener("resize", this.update);

    // assoc the scrolls
    outerDiv.onscroll = (): void => {
      childWrapper.scrollLeft = outerDiv.scrollLeft;
    };

    childWrapper.onscroll = (): void => {
      outerDiv.scrollLeft = childWrapper.scrollLeft;
    };

    // Set initial width
    this.update();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public componentDidUpdate(prevProps: Readonly<{}>): void {
    // Н - Надежность
    if (prevProps !== this.props) {
      this.forceUpdate();
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.update);
  }

  public render(): React.JSX.Element {
    const width = this.getChildWrapperWidth() || "auto";

    const outerDivStyle: React.CSSProperties = {marginTop: -1, overflowX: "auto", overflowY: "hidden"};
    const innerDivStyle: React.CSSProperties = {height: 1, width};
    const childDivStyle: React.CSSProperties = {overflow: "auto", overflowY: "hidden"};

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
  private getChildWrapperWidth(): React.CSSProperties["width"] {
    let width = null;

    if (this.childrenWrapper.current && this.childrenWrapper.current.scrollWidth) {
      width = `${this.childrenWrapper.current.scrollWidth - 1}px`;
    }

    return width;
  }

  @autobind
  private update(): void {
    this.forceUpdate();
  }

}
