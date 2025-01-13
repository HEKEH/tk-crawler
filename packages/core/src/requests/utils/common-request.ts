import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getLogger } from '../../infra/logger';

interface CommonGetRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
}

export async function commonGetRequest<
  ResponseData extends { status_code: number; data?: any; message?: string },
>({ url, headers }: CommonGetRequestParams): Promise<ResponseData> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url,
      headers,
    };
    getLogger().debug('[request] config:', config);
    const { data } = await axios<ResponseData>(config);
    if (data && 'status_code' in data && data.status_code === 0) {
      getLogger().debug('[response] success:', data);
    } else {
      getLogger().error('[response] business error:', data);
    }
    return data;
  } catch (error) {
    getLogger().error('[response] system error:', error);
    throw error;
  }
}

interface CommonPostRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
  body?: any;
}

export async function commonPostRequest<
  ResponseData extends { status_code: number; data?: any; message?: string },
>({ url, headers, body }: CommonPostRequestParams): Promise<ResponseData> {
  const logger = getLogger();
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url,
      headers,
      data: body,
    };
    logger.debug('[request] config:', config);
    const { data } = await axios<ResponseData>(config);
    if (data && 'status_code' in data && data.status_code === 0) {
      logger.debug('[response] success:', data);
    } else {
      logger.error('[response] business error:', data);
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', error);
    throw error;
  }
}
