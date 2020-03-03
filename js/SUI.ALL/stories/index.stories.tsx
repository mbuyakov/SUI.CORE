import { storiesOf } from '@storybook/react';
import { Button, DatePicker } from 'antd';
import * as React from 'react';

import { TooltipIcon } from '../src/lib/TooltipIcon';
// tslint:disable-next-line:no-import-side-effect
import '../styles/index.less';


storiesOf('Button', module)
  .add('with text', () => <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <Button>ad</Button>
    <DatePicker.RangePicker/>
    <TooltipIcon>Hello Button</TooltipIcon>
  </div>);
