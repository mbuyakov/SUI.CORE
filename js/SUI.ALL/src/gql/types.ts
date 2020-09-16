export interface ISimpleGqlFilterValue<TType> {
  isNull?: boolean;
  equalTo?: TType;
  notEqualTo?: TType;
  distinctFrom?: TType;
  notDistinctFrom?: TType;
  in?: TType[];
  notIn?: TType[];
  lessThan?: TType;
  lessThanOrEqualTo?: TType;
  greaterThan?: TType;
  greaterThanOrEqualTo?: TType;
}

export type ISimpleGqlFilter<TTable> = {
  [P in keyof TTable]?: ISimpleGqlFilterValue<TTable[P] extends number | boolean ? TTable[P] : string>;
}

export type IGqlFilter<TTable> = ISimpleGqlFilter<TTable> & {
  and?: Array<IGqlFilter<TTable>>;
  or?: Array<IGqlFilter<TTable>>;
  not?: IGqlFilter<TTable>
}
