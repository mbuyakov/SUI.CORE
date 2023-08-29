import {clamp} from "@sui/util-chore";
import {Color} from "./Color";
import {findColorBetween} from "./findColorBetween";
import {SingletonAndOnlyIoc} from "@sui/deps-ioc";

export interface IColorHeatMapSettings {
  /**
   * 0%
   */
  left: Color,
  /**
   * 50%
   */
  center: Color,
  /**
   * 100%
   */
  right: Color,
}

abstract class ColorHeatMap {
  // 0 - 99
  public abstract get(value: number): Color;
}

export class ColorHeatMapImpl extends ColorHeatMap {
  private readonly cache: Map<number, Color> = new Map<number, Color>();

  public constructor(settings: IColorHeatMapSettings) {
    super();
    for (let i = 0; i < 100; i++) {
      const left = i >= 50 ? settings.center : settings.left;
      const right = i >= 50 ? settings.right : settings.center;
      this.cache.set(i, findColorBetween(left, right, (Math.cos(Math.PI / 100 * (50 - (i >= 50 ? (i - 50) * 2 : i * 2) / 2)) ** 2) * 100));
    }
  }

  // 0 - 99
  public override get(value: number): Color {
    return this.cache.get(clamp(0, 99, Math.floor(value)))!;
  }
}

const _ColorHeatMap = SingletonAndOnlyIoc(ColorHeatMap);
export {_ColorHeatMap as ColorHeatMap};
