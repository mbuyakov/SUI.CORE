import type {ComponentMeta, ComponentStory} from "@storybook/react";
import {XYChart3DWrapper as _ChartWrapper} from "./ChartWrapper";
import React from "react";
import {Stack} from "@sui/deps-material";

const meta: ComponentMeta<typeof _ChartWrapper> = {
  title: "charts/ChartWrapper",
  component: _ChartWrapper,
  parameters: {
    controls: {
      exclude: /.*/g
    }
  }
};

export default meta;

type Story = ComponentStory<typeof _ChartWrapper>;

const Template: Story = (args) => (
  <Stack spacing={2} alignItems="start">
    <_ChartWrapper
      data={[
        {
          name: "Col 1",
          value: 50
        },
        {
          name: "Col 2",
          value: 80
        }
      ]}
      onChartCreated={(chart, amcharts) => {
        const categoryAxis = chart.xAxes.push(new amcharts.am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "name";
        const valueAxis = chart.yAxes.push(new amcharts.am4charts.ValueAxis());
        valueAxis.min = 0;
        const series = chart.series.push(new amcharts.am4charts.ColumnSeries3D());
        series.dataFields.categoryX = "name";
        series.dataFields.valueY = "value";
      }}
    />
  </Stack>
);

export const ChartWrapper = Template.bind({});
