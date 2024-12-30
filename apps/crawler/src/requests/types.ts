export enum RESPONSE_CODE {
  SUCCESS = 0,
  ERROR = 1,
}

export type ResponseDataWrapper<T> =
  | {
      status_code: RESPONSE_CODE.SUCCESS;
      data: T;
    }
  | {
      status_code: Exclude<RESPONSE_CODE, RESPONSE_CODE.SUCCESS>;
      message: string;
    };
