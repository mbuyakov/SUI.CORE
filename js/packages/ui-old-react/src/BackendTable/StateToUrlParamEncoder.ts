import {Grouping, Sorting} from "@sui/deps-dx-react-grid";
import jsonpack from "jsonpack";
import pako from "pako";
import {getSUISettings, OneOrArray, wrapInArray} from "@sui/ui-old-core";

import {BackendFilter, IExpandedGroup, SimpleBackendFilter} from "./BackendTable";

// Interfaces

interface IPageInfo {
  pageNumber: number,
  pageSize?: number // empty means default
}

export interface ITableStateDefinition {
  defaultFilter?: OneOrArray<SimpleBackendFilter>;
  filter?: OneOrArray<BackendFilter>;
  mergeFilters?: boolean;
  pageInfo?: IPageInfo;
  sorting?: Sorting[];
  grouping?: Grouping[];
  expandedGroups?: IExpandedGroup[];
}

export interface IInnerTableStateDefinition {
  defaultFilter?: SimpleBackendFilter[];
  filter?: BackendFilter[];
  mergeFilters: boolean;
  pageInfo: IPageInfo;
  sorting?: Sorting[];
  grouping?: Grouping[];
  expandedGroups?: IExpandedGroup[];
}

interface ISimpleLocation {
  pathname: string;
  searchParams: URLSearchParams;
}

interface IUrlStateDefinition {
  [tableId: string]: IInnerTableStateDefinition;
}

// Consts

const STATE_URL_PARAM = "state";

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

export function appendStateToLink(
  link: string,
  state: { [tableId: string]: ITableStateDefinition }
): string {
  const location = linkToLocation(link);

  Object.keys(state).forEach(tableId => putTableStateToLocation(location, tableId, state[tableId]));

  return locationToLink(location);
}

export function putTableStateToUrlParam(
  tableId: string,
  state: ITableStateDefinition,
): void {
  const location = getHrefLocation();

  putTableStateToLocation(location, tableId, state);

  getSUISettings().routerReplaceFn(locationToLink(location));
}

export function getStateFromUrlParam(tableId: string): IInnerTableStateDefinition | undefined {
  const state = getUrlState();

  return state && state[tableId] || undefined;
}

// Private functions

function encodeState(state: IUrlStateDefinition): string {
  return btoa(pako.deflate(jsonpack.pack(state), {to: 'string'}));
}

function decodeState(stateString: string): IUrlStateDefinition {
  return jsonpack.unpack(pako.inflate(atob(stateString), {to: 'string'}));
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

function getUrlState(
  searchParams: URLSearchParams = getHrefLocation().searchParams
): IUrlStateDefinition | undefined {
  const stateParam = searchParams.get(STATE_URL_PARAM);

  return stateParam ? decodeState(stateParam) : undefined;
}

function putTableStateToLocation(
  location: ISimpleLocation,
  tableId: string,
  state: ITableStateDefinition,
): void {
  const urlStateDefinition = getUrlState(location.searchParams) || {};

  urlStateDefinition[tableId] = {
    defaultFilter: state.defaultFilter && wrapInArray(state.defaultFilter).map(simpleFilter => {
      delete simpleFilter.lazy;
      return simpleFilter;
    }),
    filter: state.filter && wrapInArray(state.filter),
    mergeFilters: typeof (state.mergeFilters) === "boolean" ? state.mergeFilters : false,
    pageInfo: state.pageInfo || {pageNumber: 0},
    sorting: state.sorting,
    grouping: state.grouping,
    expandedGroups: state.expandedGroups
  };

  location.searchParams.set(STATE_URL_PARAM, encodeState(urlStateDefinition));
}
