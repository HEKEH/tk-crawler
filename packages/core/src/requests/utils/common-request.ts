import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getLogger } from '../../infra/logger';
import { setMessageToken } from './ms-token';

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
  shouldUpdateMsToken = true,
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
          setMessageToken(msToken);
        }
        // logger.debug('[response] success:', data);
      } else {
        logger.error('[response] business error:', data);
      }
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', error);
    throw error;
  }
}

interface CommonPostRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
  body: any;
  shouldCheckResponse?: boolean;
  shouldUpdateMsToken?: boolean;
}

export async function commonPostRequest<
  ResponseData extends { status_code: number; data?: any; message?: string },
>({
  url,
  headers,
  body,
  shouldCheckResponse = true,
  shouldUpdateMsToken = true,
}: CommonPostRequestParams): Promise<ResponseData> {
  const logger = getLogger();
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url,
      headers,
      data: typeof body !== 'string' ? JSON.stringify(body) : body,
    };
    logger.debug('[request] config:', config);
    const res = await axios<ResponseData>(config);
    const { data, headers: responseHeader } = res;

    if (shouldCheckResponse) {
      if (data && 'status_code' in data && data.status_code === 0) {
        if (shouldUpdateMsToken) {
          const msToken = responseHeader['x-ms-token'];
          setMessageToken(msToken);
        }
        // logger.debug('[response] success:', data);
      } else {
        logger.error('[response] business error:', data);
      }
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', error);
    throw error;
  }
}
