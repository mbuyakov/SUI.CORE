import {PagingPanel} from '@devexpress/dx-react-grid-material-ui';
import * as React from "react";

type ICustomPagingContainer = PagingPanel.ContainerProps & { className?: string; style?: React.CSSProperties; [x: string]: any };

export function CustomPagingContainer(props: React.Component<ICustomPagingContainer>): JSX.Element {
  return (
    <PagingPanel.Container
      {...props}
    />
  );
}
