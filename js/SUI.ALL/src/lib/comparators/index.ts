/**
 * Try to cast a and b to number and compare it
 */
export function numberComparator(a: any, b: any, nullFirst: boolean = true): number {
  if(nullFirst && a === 0 && b === 0) {
    return 0;
  }

  if(nullFirst && a === 0) {
    return 1;
  }

  if(nullFirst && b === 0) {
    return -1;
  }

  return (a - b);
}

/**
 * Try to cast a and b to number and compare it
 */
export function numberComparatorFn(nullFirst: boolean): (a: any, b: any) => number {
  return (a, b) => numberComparator(a, b, nullFirst);
}

const datePattern = /(\d{2})\.(\d{2})\.(\d{4})/;

/**
 * Try to parse a and b to date and compare it
 */
export function formattedDateComparator(a: any, b: any, nullFirst: boolean = true): number {
  const dateA = new Date(String(a).replace(datePattern,'$3-$2-$1'));
  const dateB = new Date(String(b).replace(datePattern,'$3-$2-$1'));

  const dateATime = dateA.getTime() || 0;
  const dateBTime = dateB.getTime() || 0;

  return numberComparator(dateATime, dateBTime, nullFirst);
}
