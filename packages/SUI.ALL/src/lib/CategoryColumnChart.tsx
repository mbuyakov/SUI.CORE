// tslint:disable:no-magic-numbers
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import autobind from "autobind-decorator";
import React from "react";

import { XYChartWrapper } from './ChartWrapper';
import { Color } from './color';

export interface ICategoryColumnChartSeries {
  color?: Color;
  name: string;
  tooltipText?: string;
  valueY: string;
}

export interface IAdditionalSettingProps {
  categoryAxis: am4charts.CategoryAxis;
  chart: am4charts.XYChart;
  seriesMap: Map<string, am4charts.ColumnSeries>;
  valueAxis: am4charts.ValueAxis;
}

interface ICategoryColumnChartProps {
  categoryX: string;
  // tslint:disable-next-line:no-any
  data: Array<{[field: string]: any}>;
  series: ICategoryColumnChartSeries[];
  style?: React.CSSProperties;
  title?: string;
  additionalSetting?(props: IAdditionalSettingProps): void;
}

export class CategoryColumnChart extends React.Component<ICategoryColumnChartProps> {

  public render(): JSX.Element {
    return (
      <XYChartWrapper
        type={am4charts.XYChart}
        style={{
          width: "100%",
          ...this.props.style
        }}
        data={this.props.data}
        onChartCreated={this.onChartCreated}
      />
    );
  }

  @autobind
  private createSeries(
    chart: am4charts.XYChart,
    seriesProps: ICategoryColumnChartSeries
  ): am4charts.ColumnSeries {
    const series = chart.series.push(new am4charts.ColumnSeries());

    series.dataFields.valueY = seriesProps.valueY;
    series.dataFields.categoryX = this.props.categoryX;
    series.name = name;
    series.columns.template.width = am4core.percent(95);
    if (seriesProps.tooltipText) {
      series.columns.template.tooltipText = seriesProps.tooltipText;
    }
    if (seriesProps.color) {
      series.columns.template.fill = am4core.color(seriesProps.color.toRgba());
    }

    return series;
  }

  @autobind
  private onChartCreated(chart: am4charts.XYChart): void {
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = this.props.categoryX;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 315;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.maxPrecision = 0;
    if (this.props.title) {
      valueAxis.title.text = this.props.title;
    }

    const seriesMap = this.props.series.reduce(
      (map, series) => {
        map.set(series.valueY, this.createSeries(chart, series));

        return map;
      },
      new Map<string, am4charts.ColumnSeries>()
    );

    chart.cursor = new am4charts.XYCursor();

    if (this.props.additionalSetting) {
      this.props.additionalSetting({
        categoryAxis,
        chart,
        seriesMap,
        valueAxis
      });
    }
  }

}
