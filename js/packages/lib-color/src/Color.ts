/**
 * Color class with r,g,b,a channels
 */
export class Color {
  /**
   * Convert HEX string (#FF00FF without alpha or #FF00FF00 with alpha) to Color class
   */
  public static fromHex(hex: string): Color {
    const match: string[] = hex.replace(/#/, "").match(/.{1,2}/g) as string[];

    return new Color(parseInt(match[0], 16), parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3] || "FF", 16) / 255);
  }

  /**
   * Alpha channel (0-1)
   */
  public a: number;
  /**
   * Blue channel (0-255)
   */
  public b: number;
  /**
   * Green channel (0-255)
   */
  public g: number;
  /**
   * Red channel (0-255)
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
    return `rgba(${this.r},${this.g},${this.b},${this.a === 1 ? "1" : this.a.toFixed(2)})`;
  }
}

