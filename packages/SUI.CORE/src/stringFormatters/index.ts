import lodashCamelCase from "lodash/camelCase";

import {chain} from "../other";

/**
 * Camel case string
 * Stub for lodash function
 * If input is null or undefined - return empty string
 */
export function camelCase(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  return lodashCamelCase(str);
}

/**
 * Capitalize first char in string
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Uncapitalize string
 * If input is null or undefined - return empty string
 * If 1 and 2 symbol in upper case - return original string
 */
export function unCapitalize(str: string | null | undefined): string {
  if (!str) {
    return "";
  }
  // If 2 letter in upper case - return original string
  if (str[1] && str[1].toUpperCase() === str[1]) {
    return str;
  }

  return str[0].toLowerCase() + str.slice(1);
}

/**
 * Add plural ending to string
 * If input is null - return empty string
 */
export function addPluralEnding(str: string | null | undefined): string {
  if (!str) {
    return "";
  }
  if (!str.trim()) {
    return str;
  }
  let ret: string = str;

  // If not with plural ending already
  if (str[str.length - 1] !== "s") {
    // If string end with "y" - replace ending to "ies"
    if (str[str.length - 1] === "y") {
      ret = `${str.slice(0, -1)}ie`;
    }
    ret += "s";
  } else if (str.endsWith("us")) {
    ret += "es";
  }

  return ret;
}

/**
 * Remove plural ending from string
 * If input is null - return empty string
 */
export function removePluralEnding(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  if (str.endsWith("uses")) {
    return str.slice(0, -2);
  }
  if (str.endsWith("us")) {
    return str;
  }
  if (str.endsWith("ies")) {
    return `${str.slice(0, -3)}y`;
  }
  if (str.endsWith("s")) {
    return str.slice(0, -1);
  }

  return str;
}

const sqlTimestampRegexp: RegExp = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.?\d*/;
const sqlDateRegexp: RegExp = /(\d{4})-(\d{2})-(\d{2})/;

/**
 * Format sql timestamp (2019-01-01T23:59:59.99999) to (2019-01-01 23:59:59)
 * If input is null - return empty string
 * If input cannot be formatted- return original string
 */
export function formatSqlTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return "";
  }

  return timestamp.replace(sqlTimestampRegexp, "$1-$2-$3 $4:$5:$6");
}

/**
 * Format sql timestamp (2019-01-01T23:59:59.99999) to (2019-01-01)
 * If input is null - return empty string
 * If input cannot be formatted- return original string
 */
export function formatSqlTimestampToDate(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return "";
  }

  return timestamp.replace(sqlTimestampRegexp, "$1-$2-$3");
}

/**
 * Format sql timestamp (2019-01-01T23:59:59.99999) to (23:59:59)
 * If input is null - return empty string
 * If input cannot be formatted - return original string
 */
export function formatSqlTimestampToTime(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return "";
  }

  return timestamp.replace(sqlTimestampRegexp, "$4:$5:$6");
}

/**
 * Format sql timestamp (2019-01-01) to (01.01.2019)
 * If input is null - return empty string
 * If input cannot be formatted - return original string
 */
export function formatSqlDate(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return "";
  }

  return timestamp.replace(sqlDateRegexp, "$3.$2.$1");
}

/**
 * Replace \n to \\n and replace \t to \\t
 * If input is null - return empty string
 */
export function lineFeedScreening(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  return str.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}

/**
 * Replace \" to \\"
 * If input is null - return empty string
 */
export function quoteScreening(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  return str.replace(/"/g, "\\\"");
}

/**
 * GQL formatter
 * @see quoteScreening
 * @see lineFeedScreening
 */
export function formatRawForGraphQL(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  return chain<string>(str, lineFeedScreening, quoteScreening);
}

/**
 * Replaced by lineFeedScreening
 * @deprecated
 * @see lineFeedScreening
 */
export function formatMultistringForGraphQL(str: string | null | undefined): string {
  return lineFeedScreening(str);
}

/**
 * If typeof input == string - return string in quotes
 * In other case return original input
 */
export function addQuotesIfString<T>(payload: T): string | T {
  return typeof payload === "string" ? `"${payload}"` : payload;
}

/**
 * If typeof input == string - return trimmed string
 * In other case return original input
 */
export function trimIfString<T>(payload: T): string | T {
  return typeof payload === "string" ? payload.trim() : payload;
}
