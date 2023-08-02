import {Empty} from "@sui/deps-antd";
import * as React from "react";

export const EmptyMessageComponent = (): React.JSX.Element => (
  <Empty
    description="Нет выбранных колонок"
    style={{maxWidth: "100%", margin: 0, padding: 10, borderBottom: "1px solid rgba(224, 224, 224, 1)"}}
  />
);
