import InputMask from "antd-mask-input/build/main/lib/inputmask-core";
import {NO_DATA_TEXT} from "@sui/core";
import { loadingErrorNotification } from '@/drawUtils';


/**
 * Wrap query to add loadErrorNotification
 */
export async function queryWrapper<T>(originalQuery: Promise<T>): Promise<T> {
  return originalQuery.catch(reason => {
    loadingErrorNotification(reason.stack ? reason.stack.toString() : reason.toString());
    throw reason;
  });
}


export function formatByMaskFn(pattern: string): (value: string | null | undefined) => string {
  return (value: string | null | undefined): string => {
    if (!value) {
      return NO_DATA_TEXT;
    }

    return new InputMask({
      pattern,
      value
    }).getValue();
  }
}
