export class Color {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public static fromHex(hex: string): Color {
    const match = hex.replace(/#/, '').match(/.{1,2}/g) as string[];
    return new Color(
      parseInt(match[0], 16),
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3] || "FF", 16),
    );
  }

  public toRgba(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}


// left and right are colors that you're aiming to find
// a color between. Percentage (0-100) indicates the ratio
// of right to left. Higher percentage means more right,
// lower means more left.
export function findColorBetween(left: Color, right: Color, percentage: number = 50): Color {
  return new Color(
    Math.round(left.r + (right.r - left.r) * percentage / 100),
    Math.round(left.g + (right.g - left.g) * percentage / 100),
    Math.round(left.b + (right.b - left.b) * percentage / 100),
    Math.round(left.a + (right.a - left.a) * percentage / 100),
  );
}
