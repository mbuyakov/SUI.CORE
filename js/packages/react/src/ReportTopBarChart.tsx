import * as React from "react";

import {getLevelColor, IObjectWithIndex} from '@sui/core';
import {AMCHARTS, getAmcharts} from '@sui/charts';
import {XYChartWrapper} from "./ChartWrapper";

const defaultLabelPanelWidth = 150;

const labelStyle: React.CSSProperties = {
  textAlign: 'right'
};

interface ITopBarChartProps {
  categoryDataField: string;
  customLabelText?: string;
  data?: any[];
  decimalValues?: boolean;
  labelPanelWidth?: number;
  labelTemplate?: string;
  maxPrecision?: number;
  maxValue?: number;
  tooltipTemplate?: string;
  // Relative - 0 to 100
  type: "relative" | "absolute" | string;
  valueDataField: string;

  additionalSetting?(props: IReportTopBarChartSettingProps): void;

  categoryAxisLabelGenerator(element: IObjectWithIndex): string | JSX.Element;

  onSeriesClick?(event: any): void;
}

export interface IReportTopBarChartSettingProps {
  chart: InstanceType<AMCHARTS["am4charts"]["XYChart"]>;
  series: InstanceType<AMCHARTS["am4charts"]["ColumnSeries"]>;
}

export class ReportTopBarChart extends React.Component<ITopBarChartProps, {
  mappedData?: any[];
  maxValue?: number;
}> {

  public constructor(props: ITopBarChartProps) {
    super(props);
    this.state = {};
  }

  public componentDidUpdate(prevProps: ITopBarChartProps): void {
    if (this.props.data !== prevProps.data) {
      // noinspection JSIgnoredPromiseFromCall
      this.updateState();
    }
  }

  public componentWillMount(): void {
    // noinspection JSIgnoredPromiseFromCall
    this.updateState();
  }

  public render(): JSX.Element {
    const data = this.props.data || [];
    const length = data.length;

    return (
      <div style={{display: 'flex'}}>
        {!!length && (
          <div style={{width: this.props.labelPanelWidth || defaultLabelPanelWidth, marginTop: 14, height: 286}}>
            {data.map((element: IObjectWithIndex, index) => (<div
              key={index.toString()}
              style={{height: 230 / (length || 1), display: 'flex', alignItems: 'center', ...labelStyle}}
            >
              <div style={{width: '100%'}}>
                {this.props.categoryAxisLabelGenerator(element)}
              </div>
            </div>))}
          </div>
        )}
        {this.props.data && (
          <XYChartWrapper
            style={{flexGrow: 1, height: 300}}
            data={this.state.mappedData as IObjectWithIndex[]}
            onChartCreated={(chart: InstanceType<AMCHARTS["am4charts"]["XYChart"]>, amcharts: AMCHARTS): void => {
              chart.paddingLeft = 0;

              const categoryAxis = chart.yAxes.push(new amcharts.am4charts.CategoryAxis());
              categoryAxis.dataFields.category = this.props.categoryDataField;
              categoryAxis.fontSize = 0;
              categoryAxis.renderer.grid.template.location = 0;

              const valueAxis = chart.xAxes.push(new amcharts.am4charts.ValueAxis());
              valueAxis.renderer.minGridDistance = 40;
              valueAxis.min = 0;

              if (typeof this.props.maxPrecision === 'number') {
                valueAxis.maxPrecision = this.props.maxPrecision;
              }

              if (this.props.type === "relative") {
                valueAxis.max = 99.99999999;
              } else {
                valueAxis.extraMax = 0.1;
              }

              const series = chart.series.push(new amcharts.am4charts.ColumnSeries());

              series.dataFields.valueX = this.props.valueDataField;
              series.dataFields.categoryY = this.props.categoryDataField;
              series.columns.template.propertyFields.fill = "color";
              series.columns.template.column.stroke = amcharts.am4core.color("#fff");
              series.columns.template.column.strokeOpacity = 0.2;

              if (this.props.tooltipTemplate) {
                series.columns.template.tooltipText = this.props.tooltipTemplate;
                series.tooltip.pointerOrientation = "vertical";
              }

              if (this.props.onSeriesClick) {
                series.columns.template.events.on("hit", this.props.onSeriesClick);
              }

              series.columns.template.column.cornerRadius(16, 16, 16, 16);

              const bullet = series.bullets.push(new amcharts.am4charts.LabelBullet());
              bullet.locationY = 0.1;
              bullet.label.text = this.props.customLabelText || "{valueX.formatNumber('#.##')}";
              bullet.label.fontSize = 13;
              bullet.label.padding(4, 8, 4, 8);
              bullet.label.propertyFields.horizontalCenter = "horizontalCenter";
              bullet.label.verticalCenter = "top";
              bullet.label.propertyFields.dx = "dx";
              bullet.label.truncate = false;
              bullet.label.hideOversized = false;
              bullet.dy = -2;

              const bulletBackground = new amcharts.am4core.RoundedRectangle();
              bulletBackground.height = 24;
              bulletBackground.cornerRadius(12, 12, 12, 12);
              bulletBackground.fill = amcharts.am4core.color("#FFFFFF");
              bulletBackground.strokeOpacity = 1;
              bulletBackground.strokeWidth = 2;
              bulletBackground.propertyFields.stroke = "color";

              bullet.label.background = bulletBackground;

              if (this.props.additionalSetting) {
                this.props.additionalSetting({
                  chart,
                  series
                });
              }
            }}
          />
        )}
      </div>
    );
  }

  private mapData(data: IObjectWithIndex[], maxValue: number, amcharts: AMCHARTS): IObjectWithIndex[] {
    return data.map((element) => {
      const value = element[this.props.valueDataField];
      const relativeValue = value / (maxValue || 1) * 100;
      const color = getLevelColor(relativeValue).toRgba();

      return {
        ...element,
        [this.props.valueDataField]: this.props.type === "relative" ? relativeValue : value,
        color: amcharts.am4core.color(color),
        ...(
          (relativeValue > 85)
            ? {dx: 6, horizontalCenter: "right"}
            : (relativeValue < 15)
            ? {dx: -6, horizontalCenter: "left"}
            : {dx: 0, horizontalCenter: "middle"}
        )
      }
    });
  }

  private async updateState(): Promise<void> {
    const amcharts = await getAmcharts();
    const data = this.props.data || [];
    const valueDataField = this.props.valueDataField;
    const maxValue = typeof (this.props.maxValue) === "number"
      ? this.props.maxValue
      : this.props.type === "relative"
        ? 100
        : Math.max(...data.map(element => element[valueDataField]), 0);

    this.setState({mappedData: this.mapData(data, maxValue, amcharts).reverse(), maxValue});
  }

}
