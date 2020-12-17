import * as H from "history";
import * as React from "react";
// eslint-disable-next-line no-restricted-imports
import Icon, {CustomIconComponentProps} from '@ant-design/icons/lib/components/Icon';

export * from "./AddressFlag";
export * from "./BlockUIConditionally";

export type Rendered<T extends React.Component> = React.ReactElement<T["props"]>;

export type ExtractProps<T> = T extends React.Component<infer TProps, any> ? TProps : T;

/**
 * React router location type
 */
export interface location<QueryParams extends { [K in keyof QueryParams]?: string } = {}, S = any> extends H.Location<S> {
  query: QueryParams;
}

export type IAntIconComponent = React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>>;

export const AntdIcon = Icon;
