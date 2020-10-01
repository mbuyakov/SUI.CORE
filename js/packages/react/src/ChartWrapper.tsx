import * as React from 'react';
import {AMCHARTS, getAmcharts} from "@sui/charts";

export abstract class ChartWrapper<T extends { new(): any }> extends React.Component<{
  data: any[];
  style?: React.CSSProperties;
  onChartCreated?(chart: InstanceType<T>, amcharts: AMCHARTS): void;
}> {
  public chart: InstanceType<T>;

  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  private readonly id: string = Math.random().toString(36).substr(2, 9);

  public async componentDidMount(data?: any): Promise<void> {
    const amcharts = await getAmcharts();
    this.chart = amcharts.am4core.create<InstanceType<T>>(`chartdiv_${this.id}`, this.getType(amcharts));
    // noinspection JSPrimitiveTypeWrapperUsage
    this.chart.language.locale = amcharts.am4lang_ru_RU;
    this.chart.data = data || this.props.data;
    // if (this.onChartCreated) {
    //   this.onChartCreated(this.chart, amcharts);
    // }
    if (this.props.onChartCreated) {
      this.props.onChartCreated(this.chart, amcharts);
    }
  }

  public componentWillUnmount(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  public componentWillUpdate(nextProps: any): void {
    if (this.chart.data !== nextProps.data) {
      this.chart.data = nextProps.data;
      this.chart.invalidateData();
    }
  }

  public abstract getType(amcharts: AMCHARTS): T;

  // public abstract onChartCreated(chart: T, amcharts: AMCHARTS): void;

  public render(): JSX.Element {
    const styles = this.props.style || {width: '100%', height: '100%'};
    const hasData: boolean = this.props.data.length > 0;

    return (
      <>
        <div id={`chartdiv_${this.id}`} style={{...(hasData ? {} : {display: 'none'}), ...(this.props.style || ({width: '100%', height: '100%'}))}}/>
        <div style={{display: hasData ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', ...styles}}>
          <span style={{fontSize: 16}}>Данные отсутствуют</span>
        </div>
      </>
    );
  }
}

export class XYChartWrapper extends ChartWrapper<AMCHARTS["am4charts"]["XYChart"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["XYChart"] {
    return amcharts.am4charts.XYChart;
  }
}

export class XYChart3DWrapper extends ChartWrapper<AMCHARTS["am4charts"]["XYChart3D"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["XYChart3D"] {
    return amcharts.am4charts.XYChart3D;
  }
}

export class SlicedChartWrapper extends ChartWrapper<AMCHARTS["am4charts"]["SlicedChart"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["SlicedChart"] {
    return amcharts.am4charts.SlicedChart;
  }
}

export class PieChartWrapper extends ChartWrapper<AMCHARTS["am4charts"]["PieChart"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["PieChart"] {
    return amcharts.am4charts.PieChart;
  }
}

export class PieChart3DWrapper extends ChartWrapper<AMCHARTS["am4charts"]["PieChart3D"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["PieChart3D"] {
    return amcharts.am4charts.PieChart3D;
  }
}

export class RadarChartWrapper extends ChartWrapper<AMCHARTS["am4charts"]["RadarChart"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["RadarChart"] {
    return amcharts.am4charts.RadarChart;
  }
}

export class ChordDiagramWrapper extends ChartWrapper<AMCHARTS["am4charts"]["ChordDiagram"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["ChordDiagram"] {
    return amcharts.am4charts.ChordDiagram;
  }
}

export class TreeMapWrapper extends ChartWrapper<AMCHARTS["am4charts"]["TreeMap"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4charts"]["TreeMap"] {
    return amcharts.am4charts.TreeMap;
  }
}

export class WordCloudWrapper extends ChartWrapper<AMCHARTS["am4wordCloud"]["WordCloud"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4wordCloud"]["WordCloud"] {
    return amcharts.am4wordCloud.WordCloud;
  }
}

export class MapWrapper extends ChartWrapper<AMCHARTS["am4maps"]["MapChart"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4maps"]["MapChart"] {
    return amcharts.am4maps.MapChart;
  }
}

export class ForceDirectedTreeWrapper extends ChartWrapper<AMCHARTS["am4forceDirected"]["ForceDirectedTree"]> {
  getType(amcharts: AMCHARTS): AMCHARTS["am4forceDirected"]["ForceDirectedTree"] {
    return amcharts.am4forceDirected.ForceDirectedTree;
  }
}
