import { Button, Card, Tooltip } from 'antd';
import { CardType } from 'antd/lib/card';
import * as React from 'react';
import ReactToPrint from 'react-to-print';

import { SMALL_HEADER_PADDING } from '../styles';


interface IReportElement {
  cardBodyStyle?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  header: JSX.Element | string;
  minHeight?: number;
  type?: CardType;
  print?: boolean
}

export class ReportElement extends React.Component<IReportElement> {

  private printContentRef: React.RefObject<any> = React.createRef();

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
          <Tooltip
            title="Распечатать"
          >
            <ReactToPrint
              trigger={() => (

                <Button style={{ margin: 12 }} type="primary" icon="printer"/>
              )}
              content={() => this.printContentRef.current}
            />
          </Tooltip>
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
