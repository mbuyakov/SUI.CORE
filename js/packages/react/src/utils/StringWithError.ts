export const MAGIC = "___!___";

export class StringWithError {
  public static hasError(value: string): boolean {
    return String(value).startsWith(MAGIC);
  }

  public static pack(value: string, error: string = ''): string {
    return MAGIC + error + MAGIC + value;
  }

  public static getValue(enchantedValue: string): string {
    if(!enchantedValue) {
      return '';
    }
    const values = enchantedValue.split(MAGIC);
    return values[values.length - 1];
  }

  public static getError(enchantedValue: string): string {
    if(!enchantedValue) {
      return '';
    }
    const values = enchantedValue.split(MAGIC);
    if(values.length == 1) {
      return '';
    }
    return values[1];
  }
}
