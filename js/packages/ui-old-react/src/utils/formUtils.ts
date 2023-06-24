// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export function hasErrors(fieldsError: any): boolean {
  return Object.keys(fieldsError).some(field => !!fieldsError[field]);
}
