import type { RouteComponent } from 'vue-router';
import { Menu } from '../types';

export interface CustomRouteRecord {
  path: string;
  name: string;
  menu: Menu;
  // 点击时的跳转路径
  jumpTo?: string;
  component: RouteComponent;
}

export const LoginRouteRecord: CustomRouteRecord = {
  path: '/login',
  name: '登录',
  menu: Menu.Login,
  component: () => import('../sections/login/index.vue'),
};

export const SystemManagementRouteRecord: CustomRouteRecord = {
  path: '/system-management',
  name: '系统管理',
  menu: Menu.SystemManagement,
  component: () => import('../sections/system-management/index.vue'),
};

export const GuildManagementRouteRecord: CustomRouteRecord = {
  path: '/guild-management/:subMenu?',
  name: '公会管理',
  menu: Menu.GuildManagement,
  jumpTo: '/guild-management',
  component: () => import('../sections/guild-management/index.vue'),
};
