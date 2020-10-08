import {PagingPanel} from '@devexpress/dx-react-grid-material-ui';
import * as React from "react";
import {ReactElement} from "react";
import {Select} from "antd";
import {Template} from "@devexpress/dx-react-core";
import {PagingPanel as PagingPanelBase} from "@devexpress/dx-react-grid";

type ICustomPagingContainer = PagingPanel.ContainerProps & { className?: string; style?: React.CSSProperties; [x: string]: any };

export function CustomPagingPanelContainer(props: ICustomPagingContainer): ReactElement<PagingPanelBase.ContainerProps> {
  return (
      <PagingPanel.Container
        {...props}
      >
        <Template name="custom-page-selector">
          <span>Страница:</span>
          <Select
            defaultValue={props.currentPage}
            onChange={props.onCurrentPageChange}
          >
            {Array.from({length: props.totalPages}, (_, key) => (
              <Select.Option key={key + 1} value={key + 1}>{key + 1}</Select.Option>
            ))}
          </Select>
        </Template>
      </PagingPanel.Container>
  );
}
