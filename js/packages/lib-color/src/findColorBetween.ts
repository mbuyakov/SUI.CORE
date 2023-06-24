import {Color} from "./Color";

/**
 * Left and right are colors that you're aiming to find
 * color between. Percentage (0-100) indicates the ratio
 * of right to left. Higher percentage means more right,
 * lower means more left.
 */
export function findColorBetween(left: Color, right: Color, percentage = 50): Color {
  return new Color(Math.round(left.r + ((right.r - left.r) * percentage) / 100), Math.round(left.g + ((right.g - left.g) * percentage) / 100), Math.round(left.b + ((right.b - left.b) * percentage) / 100), Math.round(left.a + ((right.a - left.a) * percentage) / 100));
}
