import type { Context, Next } from 'koa';
import { LANGUAGE_HEADER_KEY, LOG_ID_HEADER_KEY } from '@tk-crawler/biz-shared';
import { ACCEPT_LANGUAGES, I18N_LANGUAGE } from '@tk-crawler/shared';
import { v4 as uuid } from 'uuid';
import config from '../config';
import i18n from '../i18n';

export async function addContextPropsMiddleware(ctx: Context, next: Next) {
  const logId = ctx.request.header[LOG_ID_HEADER_KEY] || uuid();
  Object.defineProperty(ctx, 'logId', {
    get() {
      return logId;
    },
  });
  ctx.getRequestData = function <T>() {
    return (
      this.method === 'GET' ? this.request.query : this.request.body
    ) as T;
  };
  Object.defineProperty(ctx, 'lng', {
    get() {
      // 首先检查query里面的lng参数
      if (this.request.query?.lng) {
        return this.request.query.lng;
      }
      const customLng = this.headers[LANGUAGE_HEADER_KEY];
      if (ACCEPT_LANGUAGES.includes(customLng)) {
        return customLng;
      }
      if (config.defaultLanguage) {
        return config.defaultLanguage;
      }
      const acceptLanguage = this.headers['accept-language'];
      if (acceptLanguage) {
        const preferredLang = acceptLanguage.split(',')[0].trim().toLowerCase();
        if (
          ACCEPT_LANGUAGES.some(lang => lang.toLowerCase() === preferredLang)
        ) {
          return preferredLang;
        }
      }
      return I18N_LANGUAGE.ZH_CN;
    },
  });
  ctx.t = function (key, options) {
    const lng = this.lng;
    return i18n.t(key, { lng, ...options });
  };
  await next();
}
