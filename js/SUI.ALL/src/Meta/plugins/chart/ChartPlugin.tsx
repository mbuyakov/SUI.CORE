import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import * as React from 'react';

import { XYChartWrapper } from '../../../ChartWrapper';
import {SerializableDnDChild} from "../../../Draggable/Serializable";
import { Rendered } from '../../../other';
import {DEFAULT_ROOT_TYPES, IMetaCardRenderParams, MetaCardPlugin} from "../../MetaCardPlugin";

import {ChartSettings, SerializedChartSettings} from "./ChartSettings";

declare let window: Window & {
  CHART_PLUGIN: {
    am4charts: any,
    am4core: any
    chart?: any
  }
};

window.CHART_PLUGIN = {
  am4charts,
  am4core,
};

export class ChartPlugin extends MetaCardPlugin<SerializedChartSettings> {
  public addText = 'asd';
  public availableRootTypes = ['root'];
  public id = 'chart';
  public type = 'ex';

  public getNewSettingsInstance(): Rendered<SerializableDnDChild<SerializedChartSettings>> {
    return <ChartSettings/>;
  }

  public render(params: IMetaCardRenderParams<SerializedChartSettings>): JSX.Element {
    return (
      <XYChartWrapper
        data={[{}]/*params.item[params.props.field]*/}
        type={am4charts.XYChart}
        style={{ width: '100%', height: `${params.props.height}px` }}
        onChartCreated={(chart) => {
          window.CHART_PLUGIN.chart = chart;
          eval(`
        const am4charts = window.CHART_PLUGIN.am4charts;
        const am4core = window.CHART_PLUGIN.am4core;
        const chart = window.CHART_PLUGIN.chart;
        ${params.props.js}
        `);
        }}
      />
    );
  }
}
