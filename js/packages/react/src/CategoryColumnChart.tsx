import autobind from "autobind-decorator";
import React from "react";
import {Color} from '@sui/core';
import {AMCHARTS} from '@sui/charts';
import {XYChartWrapper} from './ChartWrapper';

export interface ICategoryColumnChartSeries {
  color?: Color;
  name: string;
  tooltipText?: string;
  valueY: string;
}

export interface IColumnDataChart {
  btiRayonName: string;
  districtName: string;
  districtId: string;
  btiRayonId: string;
}

export interface IAdditionalSettingProps {
  categoryAxis: InstanceType<AMCHARTS["am4charts"]["CategoryAxis"]>;
  chart: InstanceType<AMCHARTS["am4charts"]["XYChart"]>;
  seriesMap: Map<string, InstanceType<AMCHARTS["am4charts"]["ColumnSeries"]>>;
  valueAxis: InstanceType<AMCHARTS["am4charts"]["ValueAxis"]>;
  amcharts: AMCHARTS;
}

interface ICategoryColumnChartProps {
  categoryX: string;
  data: Array<{ [field: string]: any }>;
  series: ICategoryColumnChartSeries[];
  style?: React.CSSProperties;
  title?: string;
  additionalSetting?(props: IAdditionalSettingProps): void;
  isColumnClickable?: boolean;
  onColumnClick?(districtId?: IColumnDataChart): void;
}

export class CategoryColumnChart extends React.Component<ICategoryColumnChartProps> {

  public render(): JSX.Element {
    return (
      <XYChartWrapper
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
    chart: InstanceType<AMCHARTS["am4charts"]["XYChart"]>,
    seriesProps: ICategoryColumnChartSeries,
    amcharts: AMCHARTS
  ): InstanceType<AMCHARTS["am4charts"]["ColumnSeries"]> {
    const series = chart.series.push(new amcharts.am4charts.ColumnSeries());

    series.dataFields.valueY = seriesProps.valueY;
    series.dataFields.categoryX = this.props.categoryX;
    series.name = seriesProps.name;
    series.columns.template.width = amcharts.am4core.percent(95);
    if (seriesProps.tooltipText) {
      series.columns.template.tooltipText = seriesProps.tooltipText;
    }
    if (seriesProps.color) {
      series.columns.template.fill = amcharts.am4core.color(seriesProps.color.toRgba());
    }
    if (!!this.props.isColumnClickable) {
      series.columns.template.events.on("hit", event => {
        this.props.onColumnClick(event.target.dataItem.dataContext as IColumnDataChart)
      });
    }

    return series;
  }

  @autobind
  private onChartCreated(chart: InstanceType<AMCHARTS["am4charts"]["XYChart"]>, amcharts: AMCHARTS): void {
    const categoryAxis = chart.xAxes.push(new amcharts.am4charts.CategoryAxis());
    categoryAxis.dataFields.category = this.props.categoryX;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 315;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;

    const valueAxis = chart.yAxes.push(new amcharts.am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.maxPrecision = 0;
    if (this.props.title) {
      valueAxis.title.text = this.props.title;
    }

    const seriesMap = this.props.series.reduce(
      (map, series) => {
        map.set(series.valueY, this.createSeries(chart, series, amcharts));

        return map;
      },
      new Map<string, InstanceType<AMCHARTS["am4charts"]["ColumnSeries"]>>()
    );

    chart.cursor = new amcharts.am4charts.XYCursor();

    if (this.props.additionalSetting) {
      this.props.additionalSetting({
        categoryAxis,
        chart,
        seriesMap,
        valueAxis,
        amcharts
      });
    }
  }

}
