import { Icon as LegacyIcon } from '@ant-design/compatible';
import React from 'react';

// tslint:disable-next-line:variable-name
export const DnDDragHandler: React.FC = () => (
  <div
    style={{
      borderRight: '1px solid #bbb',
      cursor: "move",
      display: 'inline-block',
      margin: '-8px 8px -8px 0 '
    }}
    className="dragHandle"
  >
    <LegacyIcon
      type="drag"
      style={{marginRight: 8, color: '#888'}}
    />
  </div>
);
