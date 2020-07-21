/* tslint:disable:no-default-import */
import { storiesOf } from '@storybook/react';
import { Button, DatePicker } from 'antd';
import * as React from 'react';

import { TooltipIcon } from '@/index';
// tslint:disable-next-line:no-import-side-effect
import '../styles/index.less';

import LeftMenu from './menu';
import Buttons from './Buttons';
import Sparkline from './Sparkline';


storiesOf('Button', module)
  .add('with text', () => <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <Button>ad</Button>
    <DatePicker.RangePicker/>
    <TooltipIcon>Hello Button</TooltipIcon>
  </div>);


storiesOf('Menu', module)
  .addDecorator(story => <><style>{"#root{height: 100%}"}</style>{story()}</>)
  .add('Default left menu', () => <LeftMenu/>);


storiesOf('New buttons', module)
  .addDecorator(story => <><style>{"#root{height: 100%}"}</style>{story()}</>)
  .add('all', () => <Buttons/>);

storiesOf('Sparkline', module)
  .addDecorator(story => <><style>{"#root{height: 100%}"}</style>{story()}</>)
  .add('all', () => <Sparkline/>);
