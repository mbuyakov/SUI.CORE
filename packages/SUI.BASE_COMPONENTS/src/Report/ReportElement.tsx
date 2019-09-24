import { Button, Card } from 'antd';
import { CardType } from 'antd/lib/card';
import * as React from 'react';
import ReactToPrint from 'react-to-print';

import { SMALL_HEADER_PADDING } from '../styles';


interface IReportElement {
  cardBodyStyle?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  header: JSX.Element | string;
  minHeight?: number;
  print?: boolean
  type?: CardType;
}

export class ReportElement extends React.Component<IReportElement> {

  // tslint:disable-next-line:no-any
  private readonly printContentRef: React.RefObject<any> = React.createRef();

  public render(): JSX.Element {
    return (
      <Card
        className={SMALL_HEADER_PADDING}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: this.props.minHeight,
          width: '100%',
          ...this.props.cardStyle,
        }}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: 10,
          ...this.props.cardBodyStyle,
        }}
        title={<span>{this.props.header}</span>}
        extra={this.props.print ? (
          <ReactToPrint
            trigger={() => (
              <Button type="primary" icon="printer"/>
            )}
            content={() => this.printContentRef.current}
          />
        ) : undefined}
        type={this.props.type}
      >
        <div
          ref={this.printContentRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          {this.props.children}
        </div>
      </Card>
    );
  }
}
