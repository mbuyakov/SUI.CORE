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

export function appendFiltersToLink(
  link: string,
  tableId: string,
  filter: OneOrArray<SimpleBackendFilter>
): string {
  return generateLinkWithFilters(getHrefLocation(), tableId, filter);
}

export function putFiltersToUrlParam(tableId: string, filter: OneOrArray<SimpleBackendFilter>): void {
  getMetaInitProps().routerReplaceFn(generateLinkWithFilters(getHrefLocation(), tableId, filter));
}

export function getFiltersFromUrlParam(tableId: string): SimpleBackendFilter[] | undefined {
  const filters = getFilters();

  return filters && filters[tableId] || undefined;
}

// Private functions

function getHrefLocation(): ISimpleLocation {
  const href = window.location.href;

  return splitLink(href.substring(href.indexOf("#") + 1));
}

function splitLink(link: string): ISimpleLocation {
  const stubUrl = new URL(`http://stub:9999${link}`);

  return {
    pathname: stubUrl.pathname,
    searchParams: stubUrl.searchParams
  };
}

function generateLinkWithFilters(
  location: ISimpleLocation,
  tableId: string,
  filter: OneOrArray<SimpleBackendFilter>
): string {
  const filters = getFilters(location.searchParams) || {};

  filters[tableId] = wrapInArray(filter).map(simpleFilter => {
    delete simpleFilter.lazy;

    return simpleFilter;
  });

  location.searchParams.set(FILTER_URL_PARAM, encodeFilters(filters));

  return `${location.pathname}?${location.searchParams.toString()}`;
}

function getFilters(
  searchParams: URLSearchParams = getHrefLocation().searchParams
): IFilterSearchParam | undefined {
  const filterParam = searchParams.get(FILTER_URL_PARAM);

  return filterParam ? decodeFilters(filterParam) : undefined;
}

function encodeFilters(filters: IFilterSearchParam): string {
  return btoa(pako.deflate(jsonpack.pack(filters), { to: 'string' }));
}

function decodeFilters(filterString: string): IFilterSearchParam {
  return jsonpack.unpack(pako.inflate(atob(filterString), { to: 'string' }));
}
