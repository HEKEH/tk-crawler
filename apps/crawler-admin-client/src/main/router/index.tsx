import type { RouteRecordRaw } from 'vue-router';
import { hasAdminPrivilege } from '@tk-crawler/biz-shared';
import { createRouter, createWebHistory } from 'vue-router';
import { getGlobalStore } from '../utils';
import {
  AnchorManagementRouteRecord,
  CrawlerManagementRouteRecord,
  GuildManagementRouteRecord,
  LoginRouteRecord,
  NoPrivilegeRouteRecord,
  SystemManagementRouteRecord,
} from './route-records';

export const MainRouteRecords = [
  CrawlerManagementRouteRecord,
  SystemManagementRouteRecord,
  GuildManagementRouteRecord,
  AnchorManagementRouteRecord,
];

const routes: RouteRecordRaw[] = [
  {
    path: LoginRouteRecord.path,
    name: LoginRouteRecord.name,
    component: LoginRouteRecord.component,
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      try {
        await globalStore.init();
      } catch {
        next();
        return;
      }
      if (globalStore.userProfile.hasLoggedIn) {
        next('/');
        return;
      }
      globalStore.setCurrentMenu(LoginRouteRecord.menu!);
      next();
    },
  },

  {
    path: NoPrivilegeRouteRecord.path,
    name: NoPrivilegeRouteRecord.name,
    component: NoPrivilegeRouteRecord.component,
  },

  ...(MainRouteRecords.map(menu => ({
    ...menu,
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      try {
        await globalStore.init();
      } catch {
        next();
        return;
      }
      if (menu.needLogin && !globalStore.userProfile.hasLoggedIn) {
        next({
          path: LoginRouteRecord.path,
        });
        return;
      }
      if (
        menu.privilege &&
        !hasAdminPrivilege(globalStore.userProfile.role!, menu.privilege)
      ) {
        next(NoPrivilegeRouteRecord.path);
        return;
      }
      globalStore.setCurrentMenu(menu.menu ?? null);
      next();
    },
  })) as RouteRecordRaw[]),

  {
    path: '/',
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      try {
        await globalStore.init();
      } catch {
        next();
        return;
      }
      if (!globalStore.userProfile.hasLoggedIn) {
        next({
          path: LoginRouteRecord.path,
        });
        return;
      }
      const firstMenu = globalStore.primaryMenu;
      if (
        firstMenu &&
        MainRouteRecords.some(item => item.name === firstMenu.name)
      ) {
        next(firstMenu.jumpTo ?? firstMenu.path);
        return;
      }
      next();
    },
    component: <div />,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export async function redirectToLogin() {
  try {
    await router.push({
      path: LoginRouteRecord.path,
    });
  } catch (err) {
    console.error('Navigation failed:', err);
  }
}

export default router;
