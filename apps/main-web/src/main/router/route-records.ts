import type { RouteComponent } from 'vue-router';
import { Menu } from '../types';

export interface CustomRouteRecord {
  path: string;
  name: string;
  menu: Menu;
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
