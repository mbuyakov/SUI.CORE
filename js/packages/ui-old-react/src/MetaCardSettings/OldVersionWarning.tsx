import {WarningTwoTone} from "@ant-design/icons";
import {Tooltip} from "@sui/deps-antd";
import * as React from "react";

export function OldVersionWarning(props: {
  ids: [number, number]
  style?: React.CSSProperties
}): JSX.Element {
  return (
    <Tooltip
      title={`Текущая версия компонента - ${props.ids[0]}, доступна версия ${props.ids[1]}.\nДля получения доступа к новым функциям удалите элемент из карточки и добавьте заново`}
    >
      <WarningTwoTone
        style={{transform: "scale(1.5)", marginRight: 12, ...props.style}}
        twoToneColor="#ad4e00"
      />
    </Tooltip>
  );
}
