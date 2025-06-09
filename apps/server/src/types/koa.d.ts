import type {
  OrgMemberUserInfoWithOrgInfo,
  SystemAdminUser,
} from '@tk-crawler/biz-shared';
import type { I18N_LANGUAGE, Logger } from '@tk-crawler/shared';
import type { TOptions } from 'i18next';

interface CustomContext {
  readonly logId: string;
  getRequestData: <T = any>() => T;
  readonly lng: I18N_LANGUAGE | undefined;
  t: (key: string, options?: TOptions) => string;

  logger: Logger;

  readonly clientInfo?: OrgMemberUserInfoWithOrgInfo & {
    token_expires_at: number;
  };
  readonly systemUserInfo?: SystemAdminUser;
}

declare module 'koa' {
  function getRequestData<T = any>(): T;
  interface Context extends CustomContext {}
}

declare module 'koa-router' {
  interface IRouterParamContext extends CustomContext {}
}
