/* tslint:disable:no-any */
export function fileSizeValidator(maxMegabytes: number): (rule: any, value: any, callback: any) => void {
  return (rule: any, value: any, callback: any) => {
    if (value && value[0] && value[0].size > maxMegabytes * 1024 * 1024) {
      callback(`Файл превышает ${maxMegabytes} Мб и не может быть загружен.`);
    } else {
      callback();
    }
  }
}
