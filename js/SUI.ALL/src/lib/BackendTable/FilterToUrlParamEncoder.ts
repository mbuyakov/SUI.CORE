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

const FILTER_URL_PARAM = "filter";

// Public functions

export function putFiltersToUrlParam(tableId: string, filter: OneOrArray<SimpleBackendFilter>): void {
  const location = getLocation();
  const filters = getFilters(location.searchParams) || {};

  filters[tableId] = wrapInArray(filter).map(simpleFilter => {
    delete simpleFilter.lazy;

    return simpleFilter;
  });

  location.searchParams.set(FILTER_URL_PARAM, encodeFilters(filters));

  getMetaInitProps().routerReplaceFn(`${location.pathname}?${location.searchParams.toString()}`);
}

export function getFiltersFromUrlParam(tableId: string): SimpleBackendFilter[] | undefined {
  const filters = getFilters();

  return filters && filters[tableId] || undefined;
}

// Private functions

function getLocation(): ISimpleLocation {
  const href = window.location.href;
  const stubUrl = new URL(`http://stub:9999${href.substring(href.indexOf("#") + 1)}`);

  return {
    pathname: stubUrl.pathname,
    searchParams: stubUrl.searchParams
  };
}

function getFilters(searchParams: URLSearchParams = getLocation().searchParams): IFilterSearchParam | undefined {
  const filterParam = searchParams.get(FILTER_URL_PARAM);

  return filterParam ? decodeFilters(filterParam) : undefined;
}

function encodeFilters(filters: IFilterSearchParam): string {
  return btoa(pako.deflate(jsonpack.pack(filters), { to: 'string' }));
}

function decodeFilters(filterString: string): IFilterSearchParam {
  return jsonpack.unpack(pako.inflate(atob(filterString), { to: 'string' }));
}
