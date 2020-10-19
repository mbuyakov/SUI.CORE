import {WarningTwoTone} from '@ant-design/icons';
import Tooltip from 'antd/lib/tooltip';
import * as React from 'react';

export function OldVersionWarning(props: {
  ids: [number, number]
  style?: React.CSSProperties
}): JSX.Element {
  return (
    <Tooltip
      title={`Текущия версия компонента - ${props.ids[0]}, доступна версия ${props.ids[1]}.\nДля получания доступа к новым функциям удалите элемент из карточки и добавьте заново`}
    >
      <WarningTwoTone
        style={{transform: "scale(1.5)", marginRight: 12,...props.style}}
        twoToneColor="#ad4e00"
      />
    </Tooltip>
  );
}
