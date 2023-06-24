import * as React from 'react';
import {defaultIfNotBoolean} from '@sui/ui-old-core';

import {BASE_CARD_ITEM, BASE_CARD_ITEM_LABEL_HORIZONTAL} from './styles';

declare interface IDescriptionItemProps {
  children?: React.ReactNode;
  containerStyle?: React.CSSProperties;
  content?: number | string | JSX.Element;
  labelStyle?: React.CSSProperties;
  noColon?: boolean;
  title: string | JSX.Element;
}

export class DescriptionItem extends React.Component<IDescriptionItemProps> {
  public render(): JSX.Element {
    return (
      <div style={this.props.containerStyle} className={BASE_CARD_ITEM}>
        <span style={this.props.labelStyle} className={BASE_CARD_ITEM_LABEL_HORIZONTAL}>
          {this.props.title}{!defaultIfNotBoolean(this.props.noColon, false) && ':'}
        </span>
        {this.props.children || this.props.content}
      </div>
    );
  }
}
