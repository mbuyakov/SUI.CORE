import {createColorMap} from "../core";

import { Color } from './color';

declare let window: Window & {
  SUI_CORE_PTC_CACHE: Map<number, Color> | undefined;
};

export interface IPercentToColorSettings {
  /**
   * 0%
   */
  left: Color,
  /**
   * 50%
   */
  // tslint:disable-next-line:member-ordering
  center: Color,
  /**
   * 100%
   */
  right: Color,
}

/**
 * Get color by level (clamp 0-99)
 */
export function getLevelColor(level: number): Color {
  if (!window.SUI_CORE_PTC_CACHE) {
    throw new Error("PercentToColor not initialized");
  }

  return window.SUI_CORE_PTC_CACHE.get(cutNumberToPercentRange(level));
}

export function getHeatColorator(percentToColorSettings: IPercentToColorSettings): (percent: number) => Color {
  const colorMap = createColorMap(percentToColorSettings);

  return (percent: number) => colorMap.get(cutNumberToPercentRange(percent));
}

// Returns number between 0 and 99.
function cutNumberToPercentRange(value: number): number {
  return Math.min(99, Math.max(0, Math.floor(value)));
}
