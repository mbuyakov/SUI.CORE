import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import { getLevelColor, IObjectWithIndex } from '@smsoft/sui-core';
import * as React from "react";

import { XYChart3DWrapper } from './ChartWrapper';

const defaultLabelPanelWidth = 150;

const labelStyle: React.CSSProperties = {
  textAlign: 'right'
};

interface ITop3DBarChartProps {
  categoryDataField: string;
  // tslint:disable-next-line:no-any
  data?: any[];
  decimalValues?: boolean;
  labelPanelWidth?: number;
  labelTemplate?: string;
  maxValue?: number;
  // Relative - 0 to 100
  type: "relative" | "absolute" | string;
  valueDataField: string;

  // tslint:disable-next-line:no-any
  categoryAxisLabelGenerator(element: IObjectWithIndex): string | JSX.Element;
}

export class ReportTop3DBarChart extends React.Component<ITop3DBarChartProps, {
  // tslint:disable-next-line:no-any
  mappedData?: any[];
  maxValue?: number;
}> {
  public constructor(props: ITop3DBarChartProps) {
    super(props);
    this.state = {};
  }

  public componentDidUpdate(prevProps: ITop3DBarChartProps): void {
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
          <div style={{width: this.props.labelPanelWidth || defaultLabelPanelWidth, marginTop: 30, height: 270}}>
            {data.map((element: IObjectWithIndex, index) => (<div
              key={index.toString()}
              style={{height: 216 / (length || 1), display: 'flex', alignItems: 'center', ...labelStyle}}
            >
              <div style={{width: '100%'}}>
                {this.props.categoryAxisLabelGenerator(element)}
              </div>
            </div>))}
          </div>
        )}
        {this.props.data && (
          <XYChart3DWrapper
            style={{flexGrow: 1, height: 300}}
            type={am4charts.XYChart3D}
            data={this.state.mappedData as IObjectWithIndex[]}
            // tslint:disable-next-line:jsx-no-lambda
            onChartCreated={(chart): void => {
              chart.paddingLeft = 0;

              const categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
              categoryAxis.dataFields.category = this.props.categoryDataField;
              categoryAxis.fontSize = 0;

              const valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
              valueAxis.renderer.minGridDistance = 40;
              valueAxis.min = 0;
              valueAxis.maxPrecision = 0;

              if (this.props.type === "relative") {
                valueAxis.max = 99.99999999;
              } else {
                valueAxis.extraMax = 0.1;
              }

              const series = chart.series.push(new am4charts.ColumnSeries3D());

              series.dataFields.valueX = this.props.valueDataField;
              series.dataFields.categoryY = this.props.categoryDataField;
              series.columns.template.propertyFields.fill = "color";
              series.columns.template.column3D.stroke = am4core.color("#fff");
              series.columns.template.column3D.strokeOpacity = 0.2;

              const valueLabel = series.bullets.push(new am4charts.LabelBullet());
              valueLabel.label.text = `{valueX${this.props.decimalValues ? '.formatNumber("#.##")' : ''}}`;
              valueLabel.label.text = this.props.labelTemplate || `{valueX${this.props.decimalValues ? '.formatNumber("#.##")' : ''}}`;
              valueLabel.label.fontSize = 16;
              valueLabel.label.truncate = false;
              valueLabel.label.hideOversized = false;
              valueLabel.label.propertyFields.horizontalCenter = "horizontalCenter";
              valueLabel.label.propertyFields.dx = "dx";
            }}
          />)
        }
      </div>);
  }

  private mapData(data: IObjectWithIndex[]): IObjectWithIndex[] {
    return data.map((element) => {
      let value = element[this.props.valueDataField];
      if (this.props.type === "absolute") {
        value = value / (this.state && this.state.maxValue || 1) * 100;
      }

      return {
        ...element,
        color: am4core.color(getLevelColor(value).toRgba()),
        dx: value > 25 ? -10 : 30,
        horizontalCenter: value > 25 ? "right" : "left",
      }
    });
  }

  private updateState(): void {
    const data = this.props.data || [];
    const valueDataField = this.props.valueDataField;

    let maxValue: number | undefined;
    if (this.props.type === "absolute") {
      maxValue = Math.max(...data.map(element => element[valueDataField]), 0);
    }

    this.setState({mappedData: this.mapData(data).reverse(), maxValue});
  }

}
