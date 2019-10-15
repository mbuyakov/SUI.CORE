import autobind from "autobind-decorator";
import * as React from "react";

import {TableInfoManager} from "../cache";
import { NO_DATA_TEXT } from '../const';
import { getDataByKey } from '../dataKey';
import {getLinkForTable, getMetaInitProps, getRenderValue, RenderValue} from "../utils";
import { WaitData } from '../WaitData';

import { RouterLink } from './RouterLink';

interface IMetaLinkProps {
  id: string | number;
  tableInfoIdentifier: string;
  withLink?: boolean;
}

interface IMetaLinkState {
  link?: string;
  ready?: boolean;
  renderValue?: RenderValue;
}

export function metaLinkRender(table: string, withLink: boolean = false): (id: string | number | null | undefined) => JSX.Element | string {
  // tslint:disable-next-line:triple-equals
  return id => (id != null)
    ? <MetaLink tableInfoIdentifier={table} withLink={withLink} id={id}/>
    : NO_DATA_TEXT;
}

export function renderMetaLinkArray(table: string, ids: Array<string | number>, withLink: boolean = false): JSX.Element | string {
  const render = metaLinkRender(table, withLink);

  return (ids && ids.length)
    ? (
      <div
        style={{
          display: "contents"
        }}
        className="fit-content-width"
      >
        {/*TODO: Check. Old version: {...ids.map(render)}*/}
        {ids.map(render)}
      </div>
    ) : NO_DATA_TEXT
}

export class MetaLink extends React.Component<IMetaLinkProps, IMetaLinkState> {

  public async componentDidMount(): Promise<void> {
    return this.updateState();
  }

  public async componentDidUpdate(prevProps: Readonly<IMetaLinkProps>): Promise<void> {
    if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
      return this.updateState();
    }
  }

  public render(): React.ReactNode {
    return (
      <div style={{display: "inline-block"}}>
        <WaitData
          data={this.state && this.state.ready}
          alwaysUpdate={true}
        >
          {() => {
            // tslint:disable-next-line:triple-equals
            const renderValue = (this.state.renderValue != null)
              ? this.state.renderValue.value
              : this.props.id;

            return (this.props.withLink && this.state.link)
              ? <RouterLink text={renderValue} to={this.state.link} type="button"/>
              : renderValue;
          }}
        </WaitData>
      </div>
    );
  }

  @autobind
  private async updateState(): Promise<void> {
    const tableInfo = this.props.tableInfoIdentifier && await TableInfoManager.getById(this.props.tableInfoIdentifier);

    this.setState({
      link: tableInfo && getLinkForTable(tableInfo.tableName, 'card', this.props.id) || undefined,
      ready: true,
      renderValue: tableInfo
        && await getRenderValue(tableInfo, (getDataByKey(getMetaInitProps(), "user", "roles") || []), this.props.id)
        || undefined
    });
  }

}
