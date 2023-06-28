import {DragOutlined} from "@ant-design/icons";
import React from "react";

export const DnDDragHandler: React.FC = () => (
  <div
    style={{
      borderRight: "1px solid #bbb",
      cursor: "move",
      display: "inline-block",
      margin: "-8px 8px -8px 0 "
    }}
    className="dragHandle"
  >
    <DragOutlined style={{marginRight: 8, color: "#888"}}/>
  </div>
);
