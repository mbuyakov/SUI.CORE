
const charCodeZero = "0".charCodeAt(0);
const charCodeNine = "9".charCodeAt(0);

function isAsciiDigitCode(code: number): boolean {
  return(code >= charCodeZero && code <= charCodeNine);
}

function isAsciiAlphaCode(code: number): boolean {
  // tslint:disable-next-line:no-magic-numbers
  return (code >= 65 && code < 91) || (code >= 97 && code < 123);
}

function getChangesLength(prevValue: string, value: string): number {
  const isNewValueLengthy = value.length > prevValue.length;
  const minLength = isNewValueLengthy ? prevValue.length : value.length;
  const maxLength = isNewValueLengthy ? value.length : prevValue.length;
  for(let i=0; i<minLength; i += 1) {
    if(value.charAt(i) !== prevValue.charAt(i)) {
      return maxLength - i;
    }
  }
  return value.length - prevValue.length;
}

export function formatDateByMask(value: string, mask: string): string {
  let res = "";
  let maskIdx = 0;
  let valueIdx = 0;
  while(maskIdx < mask.length && valueIdx < value.length) {
    const maskIsAlpha = isAsciiAlphaCode(mask.charCodeAt(maskIdx));
    const valueIsDigit = isAsciiDigitCode(value.charCodeAt(valueIdx));
    if(maskIsAlpha) {
      if(valueIsDigit) {
        res += value.charAt(valueIdx);
        maskIdx++;
      }
      valueIdx++;
    } else {
      res += mask.charAt(maskIdx);
      maskIdx++;
      if(!valueIsDigit) {
        valueIdx++;
      }
    }
  }
  return res;
}

export function changeDateByMask(prevValue: string, value: string, mask: string): string {
  const lengthChanges = getChangesLength(prevValue, value);
  if(lengthChanges === 0) {
    return value;
  }
  if(lengthChanges === 1) {
    // added a char at the end
    const nextPos = value.length;
    const nextCode = nextPos < mask.length ? mask.charCodeAt(nextPos) : null;
    if(!!nextCode && !isAsciiAlphaCode(nextCode)) {
      return value + mask.charAt(nextPos);
    }
    return value;
  }
  if(lengthChanges === -1) {
    // removed a char from the end
    const removedPos = prevValue.length - 1;
    const removedChar = removedPos >= 0 && removedPos < mask.length ? prevValue.charAt(removedPos): null;
    if(!!removedChar && removedChar === mask.charAt(removedPos)) {
      return value.length === 0 ? "" : value.substr(0, value.length-1);
    }
    return value;
  }
  // format all over the new value
  return formatDateByMask(value, mask);
}
