/**
 * Try to cast a and b to number and compare it
 */
// tslint:disable-next-line:no-any
export function numberComparator(a: any, b: any): number {
  return (Number(a) || 0) - (Number(b) || 0);
}

const datePattern = /(\d{2})\.(\d{2})\.(\d{4})/;

/**
 * Try to parse a and b to date and compare it
 */
// tslint:disable-next-line:no-any
export function formattedDateComparator(a: any, b: any): number {
  const dateA = new Date(String(a).replace(datePattern,'$3-$2-$1'));
  const dateB = new Date(String(b).replace(datePattern,'$3-$2-$1'));

  console.log(dateA.getMilliseconds());

  return ((dateA.getTime() || 0) - (dateB.getTime() || 0));
}
