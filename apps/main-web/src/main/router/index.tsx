import type { RouteRecordRaw } from 'vue-router';
import { hasClientPrivilege } from '@tk-crawler/biz-shared';
import { createRouter, createWebHistory } from 'vue-router';
import { getGlobalStore } from '../utils';
import {
  AnchorManagementRouteRecord,
  AutoContactManagementRouteRecord,
  GuildManagementRouteRecord,
  HomeRouteRecord,
  NoPrivilegeRouteRecord,
  SystemManagementRouteRecord,
} from './route-records';

const MainRouteRecords = [
  HomeRouteRecord,
  SystemManagementRouteRecord,
  GuildManagementRouteRecord,
  AnchorManagementRouteRecord,
  AutoContactManagementRouteRecord,
];

const routes: RouteRecordRaw[] = [
  // {
  //   path: LoginRouteRecord.path,
  //   name: LoginRouteRecord.name,
  //   component: LoginRouteRecord.component,
  //   beforeEnter: async (to, from, next) => {
  //     const globalStore = getGlobalStore();
  //     try {
  //       await globalStore.init();
  //     } catch {
  //       next();
  //       return;
  //     }
  //     if (globalStore.userProfile.hasLoggedIn) {
  //       next('/');
  //       return;
  //     }
  //     globalStore.currentMenu = LoginRouteRecord.menu ?? null;
  //     next();
  //   },
  // },

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
          path: '/home',
          query: {
            login: 'true',
          },
        });
        return;
      }
      if (
        menu.privilege &&
        !hasClientPrivilege(globalStore.userProfile.role!, menu.privilege)
      ) {
        next(NoPrivilegeRouteRecord.path);
        return;
      }
      globalStore.currentMenu = menu.menu ?? null;
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
          path: '/home',
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
      path: '/home',
      query: {
        login: 'true',
      },
    });
  } catch (err) {
    console.error('Navigation failed:', err);
  }
}

export default router;
