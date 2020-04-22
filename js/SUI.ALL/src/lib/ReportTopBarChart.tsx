import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import * as React from "react";

import {XYChartWrapper} from "./ChartWrapper";
import {getLevelColor} from "./color";
import {IObjectWithIndex} from "./other";

const defaultLabelPanelWidth = 150;

const labelStyle: React.CSSProperties = {
  textAlign: 'right'
};

const KOSTYL = (value: number, color: string) => `
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 41.1 28.6" style="enable-background:new 0 0 41.1 28.6;" xml:space="preserve">
  <style type="text/css">
    .st0{fill:#FFFFFF;}
    .st1{fill:none;stroke: ${color};}
    .st3{font-size:13px;}
  </style>
  <g id="Group_125" transform="translate(-519.5 -423)">
    <g id="Rectangle_38" transform="translate(519.5 423)">
      <path class="st0" d="M14.6,0h12.3c7.9,0,14.3,6.4,14.3,14.3l0,0c0,7.9-6.4,14.3-14.3,14.3H14.6c-7.9,0-14.3-6.4-14.3-14.3l0,0    C0.3,6.4,6.7,0,14.6,0z"/>
      <path class="st1" d="M14.6,0.7h12.3c7.5,0,13.6,6.1,13.6,13.6l0,0c0,7.5-6.1,13.6-13.6,13.6H14.6C7,27.9,0.9,21.8,0.9,14.3l0,0    C0.9,6.8,7,0.7,14.6,0.7z"/>
    </g>
  </g>
  <text class="st2 st3" transform="translate(6, 18)">${(value < 10 ? " " : "") + (value === 100 ? "100.0" : value.toFixed(2))}</text>
  </svg>
`;

interface ITopBarChartProps {
  categoryDataField: string;
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
  chart: am4charts.XYChart;
  series: am4charts.ColumnSeries;
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
      this.updateState();
    }
  }

  public componentWillMount(): void {
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
            type={am4charts.XYChart}
            data={this.state.mappedData as IObjectWithIndex[]}
            onChartCreated={(chart): void => {
              chart.paddingLeft = 0;

              const categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
              categoryAxis.dataFields.category = this.props.categoryDataField;
              categoryAxis.fontSize = 0;
              categoryAxis.renderer.grid.template.location = 0;

              const valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
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

              const series = chart.series.push(new am4charts.ColumnSeries());

              series.dataFields.valueX = this.props.valueDataField;
              series.dataFields.categoryY = this.props.categoryDataField;
              series.columns.template.propertyFields.fill = "color";
              series.columns.template.column.stroke = am4core.color("#fff");
              series.columns.template.column.strokeOpacity = 0.2;

              if (this.props.tooltipTemplate) {
                series.columns.template.tooltipText = this.props.tooltipTemplate;
// @ts-ignore
                series.tooltip.pointerOrientation = "vertical";
              }

              if (this.props.onSeriesClick) {
                series.columns.template.events.on("hit", this.props.onSeriesClick);
              }

              series.columns.template.column.cornerRadius(16, 16, 16, 16);

              const bullet = series.bullets.push(new am4charts.Bullet());
              const image = bullet.createChild(am4core.Image);
              image.width = 40;
              image.height = 24;
              image.dy = 2;
              image.verticalCenter = "bottom";
              image.propertyFields.horizontalCenter = "horizontalCenter";
              image.propertyFields.dx = "dx";
              image.propertyFields.href = "svg";

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

  private mapData(data: IObjectWithIndex[], maxValue: number): IObjectWithIndex[] {
    return data.map((element) => {
      const value = element[this.props.valueDataField];
      const relativeValue = value / (maxValue || 1) * 100;
      const color = getLevelColor(relativeValue).toRgba();

      return {
        ...element,
        [this.props.valueDataField]: this.props.type === "relative" ? relativeValue : value,
        color:  am4core.color(color),
        ...(
          (relativeValue > 85)
            ? { dx: 6, horizontalCenter: "right" }
            : (relativeValue < 15)
            ? { dx: -6, horizontalCenter: "left" }
            : { dx: 0, horizontalCenter: "middle" }
        ),
        svg: `data:image/svg+xml;charset=utf-8;base64,${btoa(KOSTYL(value, color))}`
      }
    });
  }

  private updateState(): void {
    const data = this.props.data || [];
    const valueDataField = this.props.valueDataField;
    const maxValue = Math.max(...data.map(element => element[valueDataField]), 0);

    this.setState({mappedData: this.mapData(data, maxValue).reverse(), maxValue});
  }

}
