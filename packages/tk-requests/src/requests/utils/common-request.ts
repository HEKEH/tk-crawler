import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getLogger } from '../../infra';
import { saveResponseMessageToken } from './ms-token';

interface CommonGetRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
  shouldCheckResponse?: boolean;
  shouldUpdateMsToken?: boolean;
}

export async function commonGetRequest<
  ResponseData extends { status_code?: number; data?: any; message?: string },
>({
  url,
  headers,
  shouldCheckResponse = true,
  shouldUpdateMsToken = false,
}: CommonGetRequestParams): Promise<ResponseData> {
  const logger = getLogger();
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url,
      headers,
    };
    logger.debug('[request] config:', config);
    const res = await axios<ResponseData>(config);
    const { data, headers: responseHeader } = res;
    if (shouldCheckResponse) {
      if (data && 'status_code' in data && data.status_code === 0) {
        if (shouldUpdateMsToken) {
          const msToken = responseHeader['x-ms-token'];
          saveResponseMessageToken(msToken);
        }
        // logger.debug('[response] success:', data);
      } else {
        logger.error('[response] business error:', url, data);
      }
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', url, error);
    throw error;
  }
}

interface CommonPostRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
  body: any;
  transformBodyToString?: boolean;
  shouldCheckResponse?: boolean;
  shouldUpdateMsToken?: boolean;
}

export async function commonPostRequest<
  ResponseData extends { status_code?: number; data?: any; message?: string },
>({
  url,
  headers,
  body,
  transformBodyToString = false,
  shouldCheckResponse = true,
  shouldUpdateMsToken = false,
}: CommonPostRequestParams): Promise<ResponseData> {
  const logger = getLogger();
  try {
    let queryData = body;
    if (transformBodyToString) {
      queryData = typeof body !== 'string' ? JSON.stringify(body) : body;
    }
    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url,
      headers,
      data: queryData,
    };
    logger.debug('[request] config:', config);
    const res = await axios<ResponseData>(config);
    const { data, headers: responseHeader } = res;

    if (shouldCheckResponse) {
      if (data && 'status_code' in data && data.status_code === 0) {
        if (shouldUpdateMsToken) {
          const msToken = responseHeader['x-ms-token'];
          saveResponseMessageToken(msToken);
        }
        // logger.debug('[response] success:', data);
      } else {
        logger.error('[response] business error:', url, data);
      }
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', url, error);
    throw error;
  }
}
