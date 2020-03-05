import jsonpack from "jsonpack";
import pako from "pako";

import {OneOrArray, wrapInArray} from "../typeWrappers";
import {getMetaInitProps} from "../utils";

import {SimpleBackendFilter} from "./BackendTable";

// Interfaces

interface ISimpleLocation {
  pathname: string;
  searchParams: URLSearchParams;
}

interface IFilterSearchParam {
  [tableId: string]: SimpleBackendFilter[];
}

// Consts

export const MERGE_URL_PARAM = "merge";
const FILTER_URL_PARAM = "filter";

// Public functions

export function getHrefLocation(): ISimpleLocation {
  const href = window.location.href;

  return linkToLocation(href.substring(href.indexOf("#") + 1));
}

export function mergeFilters(
  oldFilters?: OneOrArray<SimpleBackendFilter>,
  newFilters?: OneOrArray<SimpleBackendFilter>
): SimpleBackendFilter[] {
  const newFiltersArray = wrapInArray(newFilters || []);
  const oldFiltersArray = wrapInArray(oldFilters || []);

  return oldFiltersArray
    .filter(oldFilter => !newFiltersArray.some(newFilter => newFilter.columnName === oldFilter.columnName))
    .concat(newFiltersArray);
}

export function appendFiltersToLink(
  link: string,
  filters: {[tableId: string]: OneOrArray<SimpleBackendFilter>},
  mergeFlag: boolean
): string {
  const location = linkToLocation(link);

  Object.keys(filters).forEach(tableId => putFiltersToLocation(location, tableId, filters[tableId]));

  if (mergeFlag) {
    location.searchParams.set(MERGE_URL_PARAM, "");
  }

  return locationToLink(location);
}

export function putFiltersToUrlParam(
  tableId: string,
  filter: OneOrArray<SimpleBackendFilter>,
  merge: boolean = false
): void {
  const location = getHrefLocation();

  putFiltersToLocation(location, tableId, filter, merge);

  getMetaInitProps().routerReplaceFn(locationToLink(location));
}

export function getFiltersFromUrlParam(tableId: string): SimpleBackendFilter[] | undefined {
  const filters = getFilters();

  return filters && filters[tableId] || undefined;
}

// Private functions

function encodeFilters(filters: IFilterSearchParam): string {
  return btoa(pako.deflate(jsonpack.pack(filters), { to: 'string' }));
}

function decodeFilters(filterString: string): IFilterSearchParam {
  return jsonpack.unpack(pako.inflate(atob(filterString), { to: 'string' }));
}

function locationToLink(location: ISimpleLocation): string {
  return `${location.pathname}?${location.searchParams.toString()}`;
}

function linkToLocation(link: string): ISimpleLocation {
  const stubUrl = new URL(`http://stub:9999${link}`);

  return {
    pathname: stubUrl.pathname,
    searchParams: stubUrl.searchParams
  };
}

function getFilters(
  searchParams: URLSearchParams = getHrefLocation().searchParams
): IFilterSearchParam | undefined {
  const filterParam = searchParams.get(FILTER_URL_PARAM);

  return filterParam ? decodeFilters(filterParam) : undefined;
}

function putFiltersToLocation(
  location: ISimpleLocation,
  tableId: string,
  filters: OneOrArray<SimpleBackendFilter>,
  merge: boolean = false
): void {
  const urlFilters = getFilters(location.searchParams) || {};

  let formattedNewFilters = wrapInArray(filters).map(simpleFilter => {
    delete simpleFilter.lazy;

    return simpleFilter;
  });

  if (merge) {
    formattedNewFilters = mergeFilters(urlFilters[tableId], formattedNewFilters);
  }

  urlFilters[tableId] = formattedNewFilters;

  location.searchParams.set(FILTER_URL_PARAM, encodeFilters(urlFilters));
}
