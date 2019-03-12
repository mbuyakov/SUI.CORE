/**
 * Color class with r,g,b,a channels
 */
export class Color {

  /**
   * Convert HEX string (#FF00FF without alpha or #FF00FF00 with alpha) to Color class
   */
  public static fromHex(hex: string): Color {
    const match: string[] = hex.replace(/#/, "")
      .match(/.{1,2}/g) as string[];

    return new Color(
      parseInt(match[0], 16),
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3] || "FF", 16),
    );
  }

  /**
   * Alpha channel
   */
  public a: number;
  /**
   * Blue channel
   */
  public b: number;
  /**
   * Green channel
   */
  public g: number;
  /**
   * Red channel
   */
  public r: number;

  public constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Convert Color to rgba format(rgba(255,0,255,0))
   */
  public toRgba(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}

/**
 * Left and right are colors that you're aiming to find
 * color between. Percentage (0-100) indicates the ratio
 * of right to left. Higher percentage means more right,
 * lower means more left.
 */
export function findColorBetween(left: Color, right: Color, percentage: number = 50): Color {
  return new Color(
    Math.round(left.r + (right.r - left.r) * percentage / 100),
    Math.round(left.g + (right.g - left.g) * percentage / 100),
    Math.round(left.b + (right.b - left.b) * percentage / 100),
    Math.round(left.a + (right.a - left.a) * percentage / 100),
  );
}
