export enum RESPONSE_CODE {
  SUCCESS = 0,
  BIZ_ERROR = 1,
  SERVER_ERROR = 2,
  TOKEN_INVALID = 3,
}

export interface RangeFilter<T = number> {
  gte?: T;
  lte?: T;
}

export type RangeViewFilter<T = number> = [T | undefined, T | undefined];

export function transformRangeViewFilterToRangeFilter<T = number>(
  rangeViewFilter: RangeViewFilter<T> | undefined,
): RangeFilter<T> | undefined {
  if (
    !rangeViewFilter?.length ||
    rangeViewFilter.every(
      item => item === undefined || item === '' || item === null,
    )
  ) {
    return undefined;
  }
  return {
    gte: rangeViewFilter[0],
    lte: rangeViewFilter[1],
  };
}
export type SortOrder = 'asc' | 'desc';
