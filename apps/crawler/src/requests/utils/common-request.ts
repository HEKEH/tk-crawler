import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { logger } from '../../infra/logger';

interface CommonGetRequestParams {
  url: string;
  headers?: Record<string, string | undefined>;
}

interface FailedResponseData { message: string }

export async function commonGetRequest<
  ResponseData extends
    | { status_code: 0; data: any }
    | FailedResponseData,
>({
  url,
  headers,
}: CommonGetRequestParams): Promise<ResponseData> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url,
      headers,
    };
    logger.log('[request] config:', config);
    const { data } = await axios<ResponseData>(config);
    if (data && 'status_code' in data && data.status_code === 0) {
      logger.log('[response] success:', data);
    } else {
      logger.error('[response] business error:', (data as FailedResponseData));
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', error);
    throw error;
  }
}
