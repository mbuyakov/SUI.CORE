import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Button } from 'antd';
import Card, { CardProps } from 'antd/lib/card';
import Popover from 'antd/lib/popover';
import * as React from 'react';

import { DnDDragHandler } from './Draggable';
import { GetPopupContainerContext, OldVersionWarning } from './MetaCardSettings';


// tslint:disable-next-line:variable-name
export const DeletableSmallCard: React.FC<Omit<CardProps, 'size' | 'type'> & {
  draggable?: boolean
  isVersionNotLast?: false | [number, number]
  settingsPopover?: React.ReactNode
  onDelete?(): void
}> = ({ title, extra, draggable, onDelete, settingsPopover, isVersionNotLast, ...rest }) => (
  <Card
    size="small"
    type="inner"
    title={
      (title || draggable) && <>
        {draggable && <DnDDragHandler/>}
        {title}
      </>
    }
    extra={
      (onDelete || extra || settingsPopover || isVersionNotLast) && <>
        {extra}
        {isVersionNotLast && <OldVersionWarning ids={isVersionNotLast}/>}
        {settingsPopover &&
        <GetPopupContainerContext.Consumer>
          {getPopupContainer => (
            <Popover
              getPopupContainer={getPopupContainer}
              content={settingsPopover}
              placement="topRight"
              trigger="click"
            >
              <Button
                href={null}
                size="small"
                icon={<LegacyIcon type="setting" />}
                style={{ marginRight: 8 }}
              />
            </Popover>
          )}
        </GetPopupContainerContext.Consumer>
        }
        {onDelete &&
        <Button
          href={null}
          size="small"
          type="danger"
          icon={<LegacyIcon type="close" />}
          onClick={onDelete}
        />}
      </>
    }
    {...rest}
  />
);
