/* eslint-disable @typescript-eslint/no-explicit-any,no-restricted-imports */
import Icon, {CustomIconComponentProps} from '@ant-design/icons/lib/components/Icon';
import * as H from "history";
import * as React from "react";

export * from "./AddressFlag";
export * from "./BlockUIConditionally";

export type Rendered<T extends React.Component> = React.ReactElement<T["props"]>;

export type ExtractProps<T> = T extends React.Component<infer TProps> ? TProps : T;

/**
 * React router location type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface location<QueryParams extends { [K in keyof QueryParams]?: string } = {}, S = any> extends H.Location<S> {
  query: QueryParams;
}

export type IAntIconComponent = React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>>;

export const AntdIcon = Icon;
