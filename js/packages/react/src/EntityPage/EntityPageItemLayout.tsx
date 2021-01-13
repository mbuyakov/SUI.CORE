import * as React from 'react';
import {EntityQuery, IObjectWithIndex, PossibleValue} from "@sui/core";
import {SUIReactComponent} from '@/SUIReactComponent';
import {DEFAULT_ITEM_RENDERER, IBaseCardItemLayout} from '@/Base';
import {WaitData} from "@/WaitData";
import {EntityQueryContext} from "@/EntityQueryContext";
import autobind from "autobind-decorator";


export type EntityPageItemLayout<ENTITY> = Omit<IBaseCardItemLayout<unknown>, "render" | "dataKey"> & {
  fieldName: keyof ENTITY & string;
}

export function renderEntityPageItemLayout(sourceItem: any, item: EntityPageItemLayout<any>, colspan: number): React.ReactNode {
  return DEFAULT_ITEM_RENDERER(sourceItem, {...item, render: () => (<EntityPageItem {...item} />)}, colspan);
}

export class EntityPageItem extends SUIReactComponent<EntityPageItemLayout<any>, {
  value: PossibleValue
}> {

  private entityQuery: EntityQuery;

  @autobind
  public render(): React.ReactNode {
    return (
      <EntityQueryContext.Consumer>
        {(entityQuery): React.ReactNode => {
          this.entityQuery = entityQuery;

          return (<WaitData
            data={this.state?.value}
            alwaysUpdate={true}
          >
            {() => (this.state?.value)}
          </WaitData>)
        }}
      </EntityQueryContext.Consumer>
    );
  }

  @autobind
  public componentDidMount() {
    this.entityQuery.subscribeOnFieldChange(this.props.fieldName, value => this.setState({value}), true);
  }
}
