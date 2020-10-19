// eslint-disable-next-line no-restricted-imports
import {CustomIconComponentProps} from '@ant-design/icons/lib/components/Icon';
import * as H from "history";
import * as React from "react";

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
