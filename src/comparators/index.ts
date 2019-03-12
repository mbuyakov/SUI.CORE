/**
 * Try to cast a and b to number and compare it
 */
// tslint:disable-next-line:no-any
export function numberComparator(a: any, b: any): number {
  return (Number(a) || 0) - (Number(b) || 0);
}
