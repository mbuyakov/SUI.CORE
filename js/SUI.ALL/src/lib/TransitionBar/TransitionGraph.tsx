/* tslint:disable:no-magic-numbers */
import autobind from "autobind-decorator";
import React from "react";

import {ForceDirectedTree, IForceDirectedTreeAdditionalSettingProps} from "../ForceDirectedTree";
import {toMap} from "../other";

import {ITransition, ITransitionStatus} from "./types";

const CHART_HEIGHT = 500;

export interface ITransitionGraphProps<TStatus, TID> {
  statuses: TStatus[];
  style?: React.CSSProperties;
  transitions: Array<ITransition<TID>>;
  statusNameExtractor(status: TStatus): string;
}

export class TransitionGraph<TStatus extends ITransitionStatus<TID>, TID> extends React.Component<ITransitionGraphProps<TStatus, TID>> {

  public render(): JSX.Element {
    const {
      statuses,
      transitions,
      statusNameExtractor
    } = this.props;
    const statusMap = toMap(statuses, status => status.id);

    return (
      <ForceDirectedTree
        style={{
          height: CHART_HEIGHT,
          ...this.props.style
        }}
        nodesLabelText="{name}"
        nodesTooltipText="{name}"
        additionalSetting={this.relationAdditionalSetting}
        data={statuses.map(status => ({
          linkWith: transitions
            .filter(transition => transition.fromId === status.id)
            .map(transition => statusNameExtractor(statusMap.get(transition.toId))),
          name: statusNameExtractor(status),
          value: 1
        }))}
      />
    );
  }

  @autobind
  private relationAdditionalSetting(props: IForceDirectedTreeAdditionalSettingProps): void {
    const series = props.series;
    series.colors.shuffle = true;
    series.fontSize = 14;

    series.nodes.template.label.hideOversized = false;
    series.nodes.template.label.truncate = false;
    series.nodes.template.label.wrap = true;

    series.links.template.strokeWidth = 3;
    series.links.template.strokeOpacity = 1;
  }

}
