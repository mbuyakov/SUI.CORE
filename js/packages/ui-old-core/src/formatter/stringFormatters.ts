import lodashCamelCase from "lodash/camelCase";

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

const pluralExclusions: [[string, string]] = [
  ["person", "people"]
];

const addPluralExclusions = new Map(pluralExclusions);
const removePluralExclusions = new Map(pluralExclusions.map(exclusion => [exclusion[1], exclusion[0]]));

/**
 * Handle plural ending exclusion
 */
function handleExclusion(str: string, exclusionMap: Map<string, string>): string | null {
  const exclusion = Array.from(exclusionMap.keys()).find(exc => str.toLowerCase().endsWith(exc));

  if (exclusion) {
    const splitPosition = str.length - exclusion.length;
    const replacedExclusion = str.substr(splitPosition);
    const shouldCapitalize = replacedExclusion.charAt(0) === replacedExclusion.charAt(0).toUpperCase();

    return `${str.substr(0, splitPosition)}${shouldCapitalize ? capitalize(exclusionMap.get(exclusion)) : exclusionMap.get(exclusion)}`;
  }

  return null;
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
  let ret: string | null = handleExclusion(str, addPluralExclusions);

  if (!ret) {
    ret = str;

    // If not with plural ending already
    if (str[str.length - 1] !== "s") {
      // If string end with "y" - replace ending to "ies"
      if (str[str.length - 1] === "y") {
        ret = `${str.slice(0, -1)}ie`;
      }
      ret += "s";
    } else if (str.endsWith("us") || str.endsWith("ss")) {
      ret += "es";
    }
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

  let ret: string | null = handleExclusion(str, removePluralExclusions);

  if (!ret) {
    ret = str;

    if (str.endsWith("uses")) {
      ret = str.slice(0, -2);
    } else if (str.endsWith("sses")) {
      ret = str.slice(0, -2);
    } else if (str.endsWith("us")) {
      ret = str;
    } else if (str.endsWith("ies")) {
      ret = `${str.slice(0, -3)}y`;
    } else if (str.endsWith("s")) {
      ret = str.slice(0, -1);
    }
  }

  return ret;
}

/**
 * Replace \n to \\n and replace \t to \\t
 * If input is null - return empty string
 */
export function lineFeedScreening(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  return str.replace(/(?<!\\)\n/g, "\\n").replace(/(?<!\\)\t/g, "\\t");
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

  return JSON.stringify(str).slice(1, -1);
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
  return typeof payload === "string" ? `"${payload as string}"` : payload;
}

/**
 * If typeof input == string - return trimmed string
 * In other case return original input
 */
export function trimIfString<T>(payload: T): string | T {
  return typeof payload === "string" ? payload.trim() : payload;
}
