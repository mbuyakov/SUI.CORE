import * as am4forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import autobind from 'autobind-decorator';
import React from "react";

import { ForceDirectedTreeWrapper } from './ChartWrapper';

export type IForceDirectedTreeDataElement<T extends {} = {}> = T & {
  children?: Array<IForceDirectedTreeDataElement<T>>;
  linkWith?: Array<IForceDirectedTreeDataElement<T>["name"]>;
  name: string;
  value?: number;
}

export interface IForceDirectedTreeAdditionalSettingProps {
  chart: am4forceDirected.ForceDirectedTree;
  series: am4forceDirected.ForceDirectedSeries;
}

interface IForceDirectedTreeProps<T> {
  data: Array<IForceDirectedTreeDataElement<T>>;
  nodesLabelText?: string;
  nodesTooltipText?: string;
  style?: React.CSSProperties;
  additionalSetting?(props: IForceDirectedTreeAdditionalSettingProps): void;
}

export class ForceDirectedTree<TElement = {}> extends React.Component<IForceDirectedTreeProps<TElement>> {

  public render(): JSX.Element {
    return (
      <ForceDirectedTreeWrapper
        type={am4forceDirected.ForceDirectedTree}
        data={this.props.data}
        style={{
          width: "100%",
          ...this.props.style
        }}
        onChartCreated={this.onChartCreated}
      />
    );
  }

  @autobind
  private onChartCreated(chart: am4forceDirected.ForceDirectedTree): void {
    const series = chart.series.push(new am4forceDirected.ForceDirectedSeries());

    console.log("ForceDirectedTree data", chart.data);

    series.dataFields.linkWith = "linkWith";
    series.dataFields.name = "name";
    series.dataFields.id = "name";
    series.dataFields.value = "value";
    series.dataFields.children = "children";

    series.nodes.template.label.hideOversized = true;
    series.nodes.template.label.truncate = true;
    if (this.props.nodesLabelText) {
      series.nodes.template.label.text = this.props.nodesLabelText;
    }

    series.nodes.template.fillOpacity = 1;
    if (this.props.nodesTooltipText) {
      series.nodes.template.tooltipText = this.props.nodesTooltipText;
    }

    series.maxLevels = 2;
series.fontSize = 10;

    if (this.props.additionalSetting) {
      this.props.additionalSetting({
        chart,
        series
      });
    }
  }

}
