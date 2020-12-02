export const MAGIC = "___!___";

export class MagicStrings {
  public static isEnchanted(value: string): boolean {
    return String(value).startsWith(MAGIC);
  }

  public static enchantValue(value: string, ...additionalValues: string[]): string {
    const additional = additionalValues?.join(MAGIC);
    return MAGIC + additional + MAGIC + value;
  }

  public static unspellValue(enchantedValue: string): string {
    if(!enchantedValue) {
      return undefined;
    }
    const values = enchantedValue.split(MAGIC);
    return values[values.length - 1];
  }

  public static unspellAdditionalValues(enchantedValue: string): string[] {
    if(!enchantedValue) {
      return [];
    }
    const values = enchantedValue.split(MAGIC);
    return values.slice(0, values.length - 1);
  }
}
