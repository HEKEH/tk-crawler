import type { AxiosRequestConfig } from 'axios';
import type { ResponseDataWrapper } from '../types';
import axios from 'axios';
import { logger } from '../../infra/logger';
import { RESPONSE_CODE } from '../types';

interface CommonGetRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
}

export async function commonGetRequest<ResponseData>({
  url,
  headers,
}: CommonGetRequestParams): Promise<ResponseDataWrapper<ResponseData>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url,
      headers,
    };
    logger.log('[request] config:', config);
    const { data } = await axios<ResponseDataWrapper<ResponseData>>(config);
    if (data.status_code === RESPONSE_CODE.SUCCESS) {
      logger.log('[response] success:', data.data);
    } else {
      logger.error('[response] business error:', data.message);
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', error);
    throw error;
  }
}
