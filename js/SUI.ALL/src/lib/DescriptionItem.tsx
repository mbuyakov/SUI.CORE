import * as React from 'react';

import { defaultIfNotBoolean } from './typeWrappers';

declare interface IDescriptionItemProps {
  containerStyle?: React.CSSProperties;
  content?: number | string | JSX.Element;
  contentAtNewLine?: boolean;
  contentStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  noColon?: boolean;
  title: string | JSX.Element;
}

export const divStyle = {
  alignItems: 'center',
  color: 'rgba(0,0,0,0.65)',
  display: 'flex',
  fontSize: 14,
  lineHeight: '20px',
  marginBottom: 8,
};

export const pStyle = {
  color: 'rgba(0,0,0,0.85)',
  display: 'inline-block',
  marginBottom: 2,
  marginRight: 6,
};

export const textStyle = {
  fontSize: '1.05em',
  fontWeight: 500,
};

export class DescriptionItem extends React.Component<IDescriptionItemProps> {
  public render(): JSX.Element {
    return (
      <div style={{...divStyle, ...this.props.containerStyle}}>
        <p style={{...pStyle, ...this.props.labelStyle}}>
          {this.props.title}{!defaultIfNotBoolean(this.props.noColon, false) && ':'}
        </p>
        <i style={{...(this.props.contentAtNewLine && {display: 'block'}), ...textStyle, ...this.props.contentStyle}}>{this.props.children || this.props.content}</i>
      </div>
    );
  }
}
