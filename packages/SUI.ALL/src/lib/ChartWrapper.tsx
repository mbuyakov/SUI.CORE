import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from '@amcharts/amcharts4/core';
import am4lang_ru_RU from '@amcharts/amcharts4/lang/ru_RU';
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import * as am4wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import * as React from 'react';

export abstract class ChartWrapper<T> extends React.Component<{
  // tslint:disable-next-line:no-any
  data: any[];
  style?: React.CSSProperties;
  // tslint:disable-next-line:no-any
  type: any;
  onChartCreated?(chart: T): void;
}> {
  // tslint:disable-next-line:no-any
  public chart: any;

  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  // tslint:disable-next-line:no-magic-numbers
  private readonly id: string = Math.random().toString(36).substr(2, 9);

  // tslint:disable-next-line:no-any
  public componentDidMount(data?: any): void {
    this.chart = am4core.create(`chartdiv_${this.id}`, this.props.type);
    // noinspection JSPrimitiveTypeWrapperUsage
    this.chart.language.locale = am4lang_ru_RU;
    this.chart.data = data || this.props.data;
    if (this.onChartCreated) {
      this.onChartCreated(this.chart);
    }
    if (this.props.onChartCreated) {
      this.props.onChartCreated(this.chart);
    }
  }

  public componentWillUnmount(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  // tslint:disable-next-line:no-any
  public componentWillUpdate(nextProps: any): void {
    if (this.chart.data !== nextProps.data) {
      this.chart.data = nextProps.data;
      this.chart.invalidateData();
    }
  }

  public abstract onChartCreated(chart: T): void;

  public render(): JSX.Element {
    const styles = this.props.style || { width: '100%', height: '100%' };
    const hasData: boolean = this.props.data.length > 0;

    return (
      <>
        <div id={`chartdiv_${this.id}`} style={{ ...(hasData ? {} : { display: 'none' }), ...(this.props.style || ({ width: '100%', height: '100%' })) }}/>
        <div style={{ display: hasData ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', ...styles }}>
          <span style={{ fontSize: 16 }}>Данные отсутствуют</span>
        </div>
      </>
    );
  }
}

/* tslint:disable:max-classes-per-file */
export abstract class XYChartWrapper extends ChartWrapper<am4charts.XYChart> {}
export abstract class XYChart3DWrapper extends ChartWrapper<am4charts.XYChart3D> {}
export abstract class SlicedChartWrapper extends ChartWrapper<am4charts.SlicedChart> {}
export abstract class PieChartWrapper extends ChartWrapper<am4charts.PieChart> {}
export abstract class PieChart3DWrapper extends ChartWrapper<am4charts.PieChart3D> {}
export abstract class RadarChartWrapper extends ChartWrapper<am4charts.RadarChart> {}
export abstract class ChordDiagramWrapper extends ChartWrapper<am4charts.ChordDiagram> {}
export abstract class TreeMapWrapper extends ChartWrapper<am4charts.TreeMap> {}
export abstract class WordCloudWrapper extends ChartWrapper<am4wordCloud.WordCloud> {}
export abstract class MapWrapper extends ChartWrapper<am4maps.MapChart> {}
export abstract class ForceDirectedTreeWrapper extends ChartWrapper<am4forceDirected.ForceDirectedTree> {}
