import {Empty} from 'antd';
import * as React from 'react';

export const EmptyMessageComponent = (): JSX.Element => (
  <Empty
    description="Нет выбранных колонок"
    style={{width: '100%', margin: 10}}
  />
);
