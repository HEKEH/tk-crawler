import type { AxiosRequestConfig } from 'axios';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import axios from 'axios';
import { ElNotification } from 'element-plus';

interface CommonRequestParams<RequestParams> {
  baseURL: string;
  method: 'get' | 'post';
  path: string;
  params?: RequestParams;
  headers?: Record<string, string | undefined>;
  data?: FormData;
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
    ElNotification.error({
      message: data.message,
    });
  }
  return data;
}
