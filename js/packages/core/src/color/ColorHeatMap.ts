import autobind from 'autobind-decorator';

import { clamp } from '@/math';
import { Color, findColorBetween } from '@/color';
import {throwIfNull} from "@/other";

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


export class ColorHeatMap {
  private readonly cache: Map<number, Color> =  new Map<number, Color>();

  public constructor(settings: IColorHeatMapSettings) {
    for (let i = 0; i < 100; i++) {
      const left = i >= 50 ? settings.center : settings.left;
      const right = i >= 50 ? settings.right : settings.center;
      this.cache.set(i, findColorBetween(left, right, Math.pow(Math.cos(Math.PI / 100 * (50 - (i >= 50 ? (i - 50) * 2 : i * 2) / 2)), 2)  * 100));
    }
  }

  // 0 - 99
  @autobind
  public get(value: number): Color {
    const floorValue = Math.floor(value);
    return throwIfNull(this.cache.get(clamp(0, 99, floorValue)), `Color for value ${floorValue} not founded`);
  }
}

declare let window: Window & {
  SUI_CORE_PTC_CACHE: ColorHeatMap | undefined;
};

/**
 * Get color by level (clamp 0-99)
 */
export function getLevelColor(level: number): Color {
  if (!window.SUI_CORE_PTC_CACHE) {
    throw new Error("PercentToColor not initialized");
  }

  return window.SUI_CORE_PTC_CACHE.get(level);
}
