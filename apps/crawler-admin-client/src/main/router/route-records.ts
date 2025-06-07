import type { RouteComponent } from 'vue-router';
import { AdminPrivilege } from '@tk-crawler/biz-shared';
import { Page } from '../types';

export interface CustomRouteRecord {
  path: string;
  name: string;
  menu?: Page;
  isPrimary?: boolean;
  needLogin?: boolean;
  only?: 'web' | 'electron'; // 只在web或electron中显示
  // 点击时的跳转路径
  jumpTo?: string;
  component: RouteComponent;
  privilege?: AdminPrivilege;
}

export const NoPrivilegeRouteRecord: CustomRouteRecord = {
  path: '/no-privilege',
  name: '无权限',
  component: () => import('../sections/no-privilege/index.vue'),
};

export const LoginRouteRecord: CustomRouteRecord = {
  path: '/login',
  name: '登录',
  menu: Page.Login,
  component: () => import('../sections/login/index.vue'),
};

export const CrawlerManagementRouteRecord: CustomRouteRecord = {
  path: '/crawler-management',
  name: '爬虫管理',
  needLogin: true,
  menu: Page.Crawler,
  only: 'electron',
  privilege: AdminPrivilege.CRAWLER_MANAGEMENT,
  jumpTo: '/crawler-management',
  component: () => import('../sections/crawler-manage/index.vue'),
};

export const SystemManagementRouteRecord: CustomRouteRecord = {
  path: '/system-management',
  name: '系统管理',
  needLogin: true,
  menu: Page.System,
  privilege: AdminPrivilege.SYSTEM_MANAGEMENT,
  jumpTo: '/system-management',
  component: () => import('../sections/system-management/index.vue'),
};

export const GuildManagementRouteRecord: CustomRouteRecord = {
  path: '/guild-management',
  name: '公会管理',
  needLogin: true,
  menu: Page.GuildManage,
  privilege: AdminPrivilege.GUILD_MANAGEMENT,
  jumpTo: '/guild-management',
  component: () => import('../sections/guild-management/index.vue'),
};

export const AnchorManagementRouteRecord: CustomRouteRecord = {
  path: '/client-management',
  name: '客户管理',
  needLogin: true,
  menu: Page.Client,
  privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  jumpTo: '/client-management',
  component: () => import('../sections/client-manage/index.vue'),
};
