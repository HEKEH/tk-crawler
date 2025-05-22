import type { RouteComponent } from 'vue-router';
import { OrgMemberRole } from '@tk-crawler/biz-shared';
import { Menu } from '../types';

export interface CustomRouteRecord {
  path: string;
  name: string;
  menu?: Menu;
  isPrimary?: boolean;
  needLogin?: boolean;
  // 点击时的跳转路径
  jumpTo?: string;
  component: RouteComponent;
  // 如果设定了roles，则只有当用户角色在roles中时，才能访问该路由
  roles?: OrgMemberRole[];
}

// export const LoginRouteRecord: CustomRouteRecord = {
//   path: '/login',
//   name: '登录',
//   menu: Menu.Login,
//   component: () => import('../sections/login/index.vue'),
// };

export const NoPrivilegeRouteRecord: CustomRouteRecord = {
  path: '/no-privilege',
  name: '无权限',
  component: () => import('../sections/no-privilege/index.vue'),
};

export const HomeRouteRecord: CustomRouteRecord = {
  path: '/home',
  name: '主页',
  menu: Menu.Home,
  component: () => import('../sections/home/index.vue'),
};

export const SystemManagementRouteRecord: CustomRouteRecord = {
  path: '/system-management/:subMenu?',
  name: '系统管理',
  needLogin: true,
  menu: Menu.SystemManagement,
  roles: [OrgMemberRole.admin],
  jumpTo: '/system-management',
  component: () => import('../sections/system-management/index.vue'),
};

export const GuildManagementRouteRecord: CustomRouteRecord = {
  path: '/guild-management/:subMenu?',
  name: '公会管理',
  needLogin: true,
  menu: Menu.GuildManagement,
  roles: [OrgMemberRole.admin],
  jumpTo: '/guild-management',
  component: () => import('../sections/guild-management/index.vue'),
};

export const AnchorManagementRouteRecord: CustomRouteRecord = {
  path: '/anchor-management/:subMenu?',
  name: '主播管理',
  needLogin: true,
  isPrimary: true,
  menu: Menu.AnchorManagement,
  jumpTo: '/anchor-management',
  component: () => import('../sections/anchor-management/index.vue'),
};

export const AutoContactManagementRouteRecord: CustomRouteRecord = {
  path: '/auto-contact-management/:subMenu?',
  name: '自动建联管理',
  needLogin: true,
  menu: Menu.AutoContactManagement,
  jumpTo: '/auto-contact-management',
  component: () => import('../sections/auto-contact-management/index.vue'),
};
