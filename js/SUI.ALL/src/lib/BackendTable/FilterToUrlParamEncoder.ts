import jsonpack from "jsonpack";
import pako from "pako";

import {OneOrArray, wrapInArray} from "../typeWrappers";
import {getMetaInitProps} from "../utils";

import {BackendFilter, SimpleBackendFilter} from "./BackendTable";

// Interfaces

export interface IOneOrArrayFilterDefinition {
  defaultFilter?: OneOrArray<SimpleBackendFilter>,
  filter?: OneOrArray<BackendFilter>
}

export interface IArrayFilterDefinition {
  defaultFilter?: SimpleBackendFilter[],
  filter?: BackendFilter[]
}

interface ISimpleLocation {
  pathname: string;
  searchParams: URLSearchParams;
}

interface IFilterSearchParam {
  [tableId: string]: IArrayFilterDefinition;
}

// Consts

export const MERGE_URL_PARAM = "merge";
const FILTER_URL_PARAM = "filter";

// Public functions

export function getHrefLocation(): ISimpleLocation {
  const href = window.location.href;

  return linkToLocation(href.substring(href.indexOf("#") + 1));
}

export function mergeDefaultFilters(
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
  filters: { [tableId: string]: IOneOrArrayFilterDefinition },
  mergeFlag: boolean
): string {
  const location = linkToLocation(link);

  Object.keys(filters).forEach(tableId => putFiltersToLocation(location, tableId, filters[tableId]));

  if (mergeFlag) {
    location.searchParams.set(MERGE_URL_PARAM, "true");
  }

  return locationToLink(location);
}

export function putFiltersToUrlParam(
  tableId: string,
  filter: IOneOrArrayFilterDefinition,
  merge: boolean = false
): void {
  const location = getHrefLocation();

  putFiltersToLocation(location, tableId, filter, merge);

  getMetaInitProps().routerReplaceFn(locationToLink(location));
}

export function getFiltersFromUrlParam(tableId: string): IArrayFilterDefinition | undefined {
  const filters = getFilters();

  return filters && filters[tableId] || undefined;
}

// Private functions

function encodeFilters(filters: IFilterSearchParam): string {
  return btoa(pako.deflate(jsonpack.pack(filters), {to: 'string'}));
}

function decodeFilters(filterString: string): IFilterSearchParam {
  return jsonpack.unpack(pako.inflate(atob(filterString), {to: 'string'}));
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
  filters: IOneOrArrayFilterDefinition,
  merge: boolean = false
): void {
  const urlFilterDefinition: IFilterSearchParam = getFilters(location.searchParams) || {};
  const tableFilters: Partial<IArrayFilterDefinition> = urlFilterDefinition[tableId] || {};

  const formattedNewDefaultFilters = filters.defaultFilter && wrapInArray(filters.defaultFilter).map(simpleFilter => {
    delete simpleFilter.lazy;

    return simpleFilter;
  });
  const formattedNewFilters = filters.filter && wrapInArray(filters.filter);

  urlFilterDefinition[tableId] = {
    defaultFilter: merge
      ? mergeDefaultFilters(tableFilters.defaultFilter, formattedNewDefaultFilters)
      : formattedNewDefaultFilters,
    filter: merge
      ? (tableFilters.filter || formattedNewFilters ? (tableFilters.filter || []).concat(formattedNewFilters || []) : undefined)
      : formattedNewFilters
  };

  location.searchParams.set(FILTER_URL_PARAM, encodeFilters(urlFilterDefinition));
}
