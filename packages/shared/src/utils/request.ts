import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { RESPONSE_CODE } from '../types';

export interface CommonRequestParams<RequestParams> {
  baseURL: string;
  method: 'get' | 'post';
  path: string;
  params?: RequestParams;
  headers?: Record<string, string | undefined>;
  data?: FormData;
  onBusinessError?: (data: {
    message: string;
    status_code: RESPONSE_CODE;
  }) => void;
}

export async function commonRequest<
  ResponseData extends { status_code: number; message?: string },
  RequestParams extends Record<string, any> = Record<string, any>,
>({
  baseURL,
  method,
  path,
  params,
  headers,
  onBusinessError,
}: CommonRequestParams<RequestParams>): Promise<ResponseData> {
  const config: AxiosRequestConfig = {
    method,
    baseURL,
    url: path,
    headers,
  };
  if (params) {
    if (method === 'get') {
      config.params = params;
    } else if (method === 'post') {
      config.data = params;
    }
  }
  const { data } = await axios<ResponseData>(config);
  if (data.status_code !== RESPONSE_CODE.SUCCESS) {
    onBusinessError?.(
      data as {
        message: string;
        status_code: RESPONSE_CODE;
      },
    );
  }
  return data;
}
