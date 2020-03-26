/* tslint:disable:no-default-export */

import { Button } from 'antd';
import * as React from 'react';
// tslint:disable-next-line:no-import-side-effect
import '../styles/index.less';


export default class Buttons extends React.Component<{}> {
  public render(): JSX.Element {
    return (
      <>
        <style>
          {`
            .SUI {
              margin: 20px;
            }
            .SUI .ant-btn {
              margin: 10px;
              border-width: 2px;
              font-size: 15px;
              line-height: 0;
            }
            .SUI .ant-btn-sm {
              font-size: 12px;
            }
            .SUI .ant-btn-lg {
              font-size: 17px;
            }
            .SUI .ant-btn-lg:not(.ant-btn-round), .SUI .ant-btn:not(.ant-btn-round) {
              border-radius: 8px;
            }
            .SUI .ant-btn-sm:not(.ant-btn-round) {
              border-radius: 6px;
            }
          `}
        </style>
        <div className="SUI">
          <div>
            <Button size="large" type="primary">Primary</Button>
            <Button size="large" type="primary" danger={true}>Primary danger</Button>
            <Button size="large" danger={true}>Danger</Button>
            <Button size="large">Default</Button>
            <Button size="large" type="dashed">Dashed</Button>
            <Button size="large"  type="dashed" disabled={true}>Dashed disabled</Button>
            <Button size="large"  disabled={true}>Disabled</Button>

            <Button size="middle" type="primary">Primary</Button>
            <Button size="middle" type="primary" danger={true}>Primary danger</Button>
            <Button size="middle" danger={true}>Danger</Button>
            <Button size="middle">Default</Button>
            <Button size="middle" type="dashed">Dashed</Button>
            <Button size="middle"  type="dashed" disabled={true}>Dashed disabled</Button>
            <Button size="middle"  disabled={true}>Disabled</Button>

            <Button size="small" type="primary">Primary</Button>
            <Button size="small" type="primary" danger={true}>Primary danger</Button>
            <Button size="small" danger={true}>Danger</Button>
            <Button size="small">Default</Button>
            <Button size="small" type="dashed">Dashed</Button>
            <Button size="small"  type="dashed" disabled={true}>Dashed disabled</Button>
            <Button size="small"  disabled={true}>Disabled</Button>
          </div>
          <div>
            <Button size="large" shape="round" type="primary">Primary</Button>
            <Button size="large" shape="round" type="primary" danger={true}>Primary danger</Button>
            <Button size="large" shape="round" danger={true}>Danger</Button>
            <Button size="large" shape="round">Default</Button>
            <Button size="large" shape="round" type="dashed">Dashed</Button>
            <Button size="large" shape="round" type="dashed" disabled={true}>Dashed disabled</Button>
            <Button size="large" shape="round" disabled={true}>Disabled</Button>

            <Button size="middle" shape="round" type="primary">Primary</Button>
            <Button size="middle" shape="round" type="primary" danger={true}>Primary danger</Button>
            <Button size="middle" shape="round" danger={true}>Danger</Button>
            <Button size="middle" shape="round">Default</Button>
            <Button size="middle" shape="round" type="dashed">Dashed</Button>
            <Button size="middle" shape="round" type="dashed" disabled={true}>Dashed disabled</Button>
            <Button size="middle" shape="round" disabled={true}>Disabled</Button>

            <Button size="small" shape="round" type="primary">Primary</Button>
            <Button size="small" shape="round" type="primary" danger={true}>Primary danger</Button>
            <Button size="small" shape="round" danger={true}>Danger</Button>
            <Button size="small" shape="round">Default</Button>
            <Button size="small" shape="round" type="dashed">Dashed</Button>
            <Button size="small" shape="round" type="dashed" disabled={true}>Dashed disabled</Button>
            <Button size="small" shape="round" disabled={true}>Disabled</Button>
          </div>
        </div>
      </>
    );
  }
};
