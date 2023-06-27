import {PrinterOutlined} from '@ant-design/icons';
import {Button, Card} from "@sui/deps-antd";
import * as React from 'react';
import ReactToPrint from 'react-to-print';

// noinspection ES6PreferShortImport
import {SMALL_HEADER_PADDING} from '../styles';

import {PrintModeContext} from './PrintModeContext';
import {CardType} from "@sui/deps-antd";

interface IReportElement {
  children?: React.ReactNode
  cardBodyStyle?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  header?: JSX.Element | string;
  minHeight?: number;
  print?: boolean
  type?: CardType;
}

export class ReportElement extends React.Component<IReportElement, {
  printMode: boolean
}> {

  // tslint:disable-next-line:no-any
  private readonly printContentRef: React.RefObject<HTMLDivElement> = React.createRef();

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
        title={this.props.header}
        extra={this.props.print ? (
          <ReactToPrint
            // eslint-disable-next-line react/no-unstable-nested-components
            trigger={(): JSX.Element => (<Button icon={<PrinterOutlined/>}/>)}
            content={(): HTMLDivElement => this.printContentRef.current}
            onBeforeGetContent={(): Promise<void> => new Promise(resolve => {this.setState({printMode: true}, resolve)})}
            onAfterPrint={(): void => this.setState({printMode: false})}
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
            {this.state.printMode ? (<h2>{this.props.header}</h2>) : undefined}
            {this.props.children}
          </div>
        </PrintModeContext.Provider>
      </Card>
    );
  }
}
