/*eslint sort-exports/sort-exports: 2*/
const TRANSLATE_MAP = new Map<string, string>();
let customPostProcessor: CustomPostProcessor | undefined;

export type CustomPostProcessor = (key: string, returnNull: boolean) => string | null;

/**
 * Add translate key
 */
export function addTranslate(key: string, text: string): void {
  TRANSLATE_MAP.set(key.toLowerCase(), text);
}

/**
 * Set post processor for not founded key
 */
export function setCustomPostProcessor(processor: CustomPostProcessor): void {
  customPostProcessor = processor;
}

/**
 * Translate test
 */
export function translate(text: string, returnNull: boolean = false): string | null {
  let ret: string | undefined;
  if(text) {
    ret = TRANSLATE_MAP.get(text.toLowerCase());
    if(typeof ret === "string") {
      return ret;
    }
  }

  if(customPostProcessor) {
    return customPostProcessor(text, returnNull);
  }
  if (returnNull) {
    return null;
  }
  console.error(`Can't translate "${text}"`);

  return text;
}
