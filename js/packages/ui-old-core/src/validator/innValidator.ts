const checkSumMaskInnFirst = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
const checkSumMaskInnSecond = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

export function innValidator(inn: string): string {
  const innNumber = inn.split("").map(Number);
  const firstCheckSum = checkSumMaskInnFirst.map((value, index) => value * innNumber[index]).reduce((previousValue, currentValue) => previousValue + currentValue) % 11;
  const secondCheckSum = checkSumMaskInnSecond.map((value, index) => value * innNumber[index]).reduce((previousValue, currentValue) => previousValue + currentValue) % 11;

  return inn.length < 12 ? "" : (firstCheckSum > 9 ? firstCheckSum % 10 : firstCheckSum) === innNumber[10] && (secondCheckSum > 9 ? secondCheckSum % 10 : secondCheckSum) === innNumber[11] ? "" : "Ошибка. Некорректный ИНН";
}
