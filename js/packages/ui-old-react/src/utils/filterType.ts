export enum FilterType {
  NUMBER = "NUMBER",
  DATE = "DATE",
  TIMESTAMP = "TIMESTAMP",
  BOOLEAN = "BOOLEAN",
  STRING = "STRING"
}

export function isMomentType(type: FilterType | undefined): boolean {
  return !!type && [FilterType.DATE, FilterType.TIMESTAMP].includes(type);
}
