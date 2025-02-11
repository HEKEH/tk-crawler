export type CommonResult<T> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      message: string;
    };
