import {RouteComponentProps} from 'react-router-dom';
import autobind from "autobind-decorator";
import {EntityQuery, Logger, Merge, PossibleId} from "@sui/core";
import {SUIReactComponent} from "@/SUIReactComponent";
import {BaseCard, IBaseCardProps} from '@/Base';
import {Rendered} from '@/other';
import React from "react";
import {EntityQueryContext} from "@/EntityQueryContext";
import {EntityPageItemLayout, renderEntityPageItemLayout} from './EntityPageItemLayout';

export type EntityPageProps = RouteComponentProps<{ id: string }>;

export interface EntityPageState<T> {
  pageData: T,
}

export abstract class EntityPage<P, S extends Partial<EntityPageState<ENTITY>>, ENTITY extends { id: PossibleId }> extends SUIReactComponent<EntityPageProps & P, Merge<Partial<S>, EntityPageState<ENTITY>>> {
  public readonly log: Logger;
  public readonly entityQuery: EntityQuery;

  protected constructor(props: EntityPageProps & P) {
    super(props);
    this.log = new Logger(this.getComponentName());
    const id = this.props.match.params.id;
    this.entityQuery = new EntityQuery(this.getEntity(), this.mapId(id));
    this.registerInterval(this.entityQuery.start());
    this.log.info("EntityPage initialized");
    // noinspection JSIgnoredPromiseFromCall
    this.refetchPageData(id);
  }

  @autobind
  public componentDidUpdate(prevProps: EntityPageProps): void {
    if (this.props.match.params.id != prevProps.match.params.id) {
      const newId = this.props.match.params.id;
      const oldId = prevProps.match.params.id;
      this.log.info(`Id changed. ${oldId}->${newId}`);
      this.entityQuery.changeId(newId);
      this.componentDidChangeId(newId, oldId);
    }
  }

  @autobind
  public componentWillUnmount() {
    super.componentWillUnmount();
    this.entityQuery.stop();
  }

  @autobind
  public async refetchPageData(id: string = this.props.match.params.id): Promise<void> {
    const pageData = await this.fetchPageData(id);
    this.setState({pageData});
  }

  @autobind
  public async getBaseCardItem(id: string): Promise<ENTITY> {
    // TODO
    return {id} as unknown as ENTITY;
  }

  @autobind
  public render(): React.ReactNode {
    const baseCard = (
      <BaseCard itemRenderer={renderEntityPageItemLayout} {...this.getBaseCardProps()}/>
    );

    return (
      <EntityQueryContext.Provider value={this.entityQuery}>
        {this.customRender(baseCard)}
      </EntityQueryContext.Provider>
    );
  }

  // For logger
  public abstract getComponentName(): string;

  //Entity name
  public abstract getEntity(): string;

  // BaseCard layout to display
  public abstract getBaseCardProps(): Omit<IBaseCardProps<ENTITY, EntityPageItemLayout<ENTITY>>, "item" | "itemRenderer">;


  protected async fetchPageData(id: string): Promise<ENTITY> {
    // Override me
    return Promise.resolve(undefined);
  }


  public componentDidChangeId(newId: string, oldId: string): void {
    // Override me
  }

  public mapId(id: string): PossibleId {
    // Override me
    return id;
  }

  public customRender(baseCard: Rendered<BaseCard>): React.ReactNode {
    // Override me
    return baseCard;
  }

}
