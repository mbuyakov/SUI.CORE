export function hasErrors(fieldsError: any): boolean {
  return Object.keys(fieldsError).some(field => !!fieldsError[field]);
}
