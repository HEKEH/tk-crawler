import type { OrgMemberUserInfoWithOrgInfo } from '@tk-crawler/biz-shared';
import type { I18N_LANGUAGE } from '@tk-crawler/shared';
import type { TOptions } from 'i18next';

interface CustomContext {
  readonly logId: string;
  getRequestData: <T = any>() => T;
  readonly lng: I18N_LANGUAGE | undefined;
  t: (key: string, options?: TOptions) => string;

  readonly clientInfo?: OrgMemberUserInfoWithOrgInfo;
}

declare module 'koa' {
  function getRequestData<T = any>(): T;
  export interface Context extends CustomContext {}
}

declare module 'koa-router' {
  export interface IRouterParamContext extends CustomContext {}
}
