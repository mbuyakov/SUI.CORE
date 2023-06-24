/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {AMCHARTS, getAmcharts} from "@sui/deps-amcharts";
import {useAsyncEffect, useHandler, useService} from "@sui/lib-hooks";
import {ThemeChangedEvent, ThemeService} from "@sui/ui-themes";
import {Nullable} from "@sui/util-types";

export interface IChartWrapperProps<T extends { new(): any }> {
  data: any[];
  style?: React.CSSProperties;

  onChartCreated?(chart: InstanceType<T>, amcharts: AMCHARTS): void;
}


export function ChartWrapper<T extends { new(): any }>(getType: (amcharts: AMCHARTS) => T): React.FC<IChartWrapperProps<T>> {
  return (props) => {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [chart, setChart] = useState<Nullable<InstanceType<T>>>();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const themeService = useService(ThemeService);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [theme, setTheme] = useState(themeService.getCurrentTheme());
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHandler(themeService.addHandler(ThemeChangedEvent, (e) => {
      setTheme(e.theme);
    }), []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (chart) {
        chart.dispose();
        setChart(null);
      }
    }, [theme]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAsyncEffect(async () => {
      const amcharts = await getAmcharts();
      if (!chart) {
        console.log(theme);
        if (theme === "dark") {
          amcharts.am4core.useTheme(amcharts.am4themes_dark);
        } else {
          amcharts.am4core.unuseTheme(amcharts.am4themes_dark);
        }
        const newChart = amcharts.am4core.create<InstanceType<T>>(`chartdiv_${id}`, getType(amcharts));
        newChart.language.locale = amcharts.am4lang_ru_RU;
        props.onChartCreated?.(newChart, amcharts);
        setChart(newChart);
      } else {
        chart.data = props.data;
        chart.invalidateData();
      }

    }, [chart, props.data]);

    const styles = props.style || {width: '100%', height: '100%'};
    const hasData = props.data.length > 0;

    return (
      <>
        <div id={`chartdiv_${id}`} style={{...(hasData ? {} : {display: 'none'}), ...styles}}/>
        <div style={{display: hasData ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', ...styles}}>
          <span style={{fontSize: 16}}>Данные отсутствуют</span>
        </div>
      </>
    );
  }
}


export const XYChartWrapper = ChartWrapper<AMCHARTS["am4charts"]["XYChart"]>(amcharts => amcharts.am4charts.XYChart);
export const XYChart3DWrapper = ChartWrapper<AMCHARTS["am4charts"]["XYChart3D"]>(amcharts => amcharts.am4charts.XYChart3D);
export const SlicedChartWrapper = ChartWrapper<AMCHARTS["am4charts"]["SlicedChart"]>(amcharts => amcharts.am4charts.SlicedChart);
export const PieChartWrapper = ChartWrapper<AMCHARTS["am4charts"]["PieChart"]>(amcharts => amcharts.am4charts.PieChart);
export const PieChart3DWrapper = ChartWrapper<AMCHARTS["am4charts"]["PieChart3D"]>(amcharts => amcharts.am4charts.PieChart3D);
export const RadarChartWrapper = ChartWrapper<AMCHARTS["am4charts"]["RadarChart"]>(amcharts => amcharts.am4charts.RadarChart);
export const ChordDiagramWrapper = ChartWrapper<AMCHARTS["am4charts"]["ChordDiagram"]>(amcharts => amcharts.am4charts.ChordDiagram);
export const TreeMapWrapper = ChartWrapper<AMCHARTS["am4charts"]["TreeMap"]>(amcharts => amcharts.am4charts.TreeMap);
export const WordCloudWrapper = ChartWrapper<AMCHARTS["am4wordCloud"]["WordCloud"]>(amcharts => amcharts.am4wordCloud.WordCloud);
export const MapWrapper = ChartWrapper<AMCHARTS["am4maps"]["MapChart"]>(amcharts => amcharts.am4maps.MapChart);
export const ForceDirectedTreeWrapper = ChartWrapper<AMCHARTS["am4forceDirected"]["ForceDirectedTree"]>(amcharts => amcharts.am4forceDirected.ForceDirectedTree);
