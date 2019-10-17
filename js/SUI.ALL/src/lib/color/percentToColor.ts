import { Color, findColorBetween } from './color';

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


declare let window: Window & {
  /**
   * Variable for global getLevelColor cache
   */
  SUI_CORE_PTC_CACHE: Map<number, Color> | undefined;
};

/**
 * Must be call before use getLevelColor
 */
export function initPercentToColor(percentToColorSettings: IPercentToColorSettings): void {
  window.SUI_CORE_PTC_CACHE = new Map<number, Color>();
  for (let i = 0; i < 100; i++) {
    const left = i >= 50 ? percentToColorSettings.center : percentToColorSettings.left;
    const right = i >= 50 ? percentToColorSettings.right : percentToColorSettings.center;
    window.SUI_CORE_PTC_CACHE.set(i, findColorBetween(left, right, Math.pow(Math.cos(Math.PI / 100 * (50 - (i >= 50 ? (i - 50) * 2 : i * 2) / 2)), 2)  * 100));
  }
}

/**
 * Get color by level (clamp 0-99)
 */
export function getLevelColor(level: number): Color {
  if (!window.SUI_CORE_PTC_CACHE) {
    throw new Error("PercentToColor not initialized");
  }

  return window.SUI_CORE_PTC_CACHE.get(Math.min(99, Math.max(0, Math.floor(level))));
}
