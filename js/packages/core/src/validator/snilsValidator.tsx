const checkSumMaskSnils = [9, 8, 7, 6, 5, 4, 3, 2, 1];

export function snilsValidator(snils: string): string {

  if (parseInt(snils.slice(0, -2), 10) > 1001998) {
    const innNumber = snils.split("").map(Number);
    const check = 10 * innNumber[9] + innNumber[10];
    const sum = checkSumMaskSnils.map((value, index) => value * innNumber[index]).reduce((previousValue, currentValue) => previousValue + currentValue);
    let checkDigit = 0

    if (sum < 100) {
      checkDigit = sum;
    } else if (sum > 101) {
      checkDigit = sum % 101;
      if (checkDigit === 100) {
        checkDigit = 0;
      }
    }
    return snils.length < 11 ? '' : checkDigit == check ? '' : "Ошибка. Некорректный СНИЛС";
  } else {
    return '';
  }
}
