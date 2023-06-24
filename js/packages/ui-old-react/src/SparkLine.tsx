import { Container } from "@sui/deps-ioc";
import { ColorHeatMap } from "@sui/lib-color";
import * as React from "react";

interface ISparkLineProps {
  value: number;
}

export function SparkLine(props: ISparkLineProps): JSX.Element {
  const {value} = props;

  return (
    <div className="SPARKLINE">
      <div className="SPARKLINE-VALUE" style={{width: `calc(${Math.min(value, 100)}% + 4px)`, backgroundColor: Container.get(ColorHeatMap).get(value).toRgba()}}/>
      <div className="SPARKLINE-LABEL">
        <span>{value.toFixed(2)}</span>
      </div>
    </div>
  );
}
