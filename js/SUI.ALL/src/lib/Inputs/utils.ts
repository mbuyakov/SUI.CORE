export function maskValidator(value: string, mask: string, totalValueLength: number, allowEmpty: boolean | undefined): () => string {
  return () => ((value.length === totalValueLength) || (value.length === 0 && allowEmpty)) ? '' : `Заполните поле по маске ${mask}`;
}
