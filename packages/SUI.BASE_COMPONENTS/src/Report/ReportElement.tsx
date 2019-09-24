import { Button, Card } from 'antd';
import { CardType } from 'antd/lib/card';
import * as React from 'react';
import ReactToPrint from 'react-to-print';

import { SMALL_HEADER_PADDING } from '../styles';

import { PrintModeContext } from './PrintModeContext';


interface IReportElement {
  cardBodyStyle?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  header: JSX.Element | string;
  minHeight?: number;
  print?: boolean
  type?: CardType;
}

export class ReportElement extends React.Component<IReportElement, {
  printMode: boolean
}> {

  // tslint:disable-next-line:no-any
  private readonly printContentRef: React.RefObject<any> = React.createRef();

  public constructor(props: IReportElement) {
    super(props);
    this.state = {
      printMode: false
    };
  }

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
            onBeforeGetContent={async () => new Promise(resolve => this.setState({printMode: true}, resolve))}
            onAfterPrint={() => this.setState({printMode: false})}
          />
        ) : undefined}
        type={this.props.type}
      >
        <PrintModeContext.Provider value={this.state.printMode}>
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
        </PrintModeContext.Provider>
      </Card>
    );
  }
}

