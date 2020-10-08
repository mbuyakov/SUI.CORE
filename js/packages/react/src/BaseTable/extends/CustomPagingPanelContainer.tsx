import {PagingPanel} from '@devexpress/dx-react-grid-material-ui';
import * as React from "react";
import {Select} from "antd";

type ICustomPagingContainer = PagingPanel.ContainerProps & { className?: string; style?: React.CSSProperties; [x: string]: any };

export function CustomPagingPanelContainer(props: ICustomPagingContainer): JSX.Element {
  return (
    <div>
      <PagingPanel.Container
        {...props}
      />
      <Select
        onChange={props.onCurrentPageChange}
      >
        {Array.from({length: props.totalPages}, (_, key) => (
          <Select.Option key={key + 1} value={key + 1}>{key + 1}</Select.Option>
        ))}
      </Select>
    </div>
  );
}
