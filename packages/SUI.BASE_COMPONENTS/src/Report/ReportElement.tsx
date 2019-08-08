import {Card} from "antd";
import {CardType} from "antd/lib/card";
import * as React from "react";

import {SMALL_HEADER_PADDING} from "../styles";


interface IReportElement {
  cardBodyStyle?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  header: JSX.Element | string;
  minHeight?: number;
  type?: CardType;
}

export class ReportElement extends React.Component<IReportElement> {

  public render(): JSX.Element {
    return (
      <Card
        className={SMALL_HEADER_PADDING}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: "100%",
          minHeight: this.props.minHeight,
          width: '100%',
          ...this.props.cardStyle
        }}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: 10,
          ...this.props.cardBodyStyle
        }}
        title={this.props.header}
        type={this.props.type}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
          }}
        >
          {this.props.children}
        </div>
      </Card>
    )
  }

}
