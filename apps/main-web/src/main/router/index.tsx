import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { getGlobalStore } from '../utils';
import {
  AnchorManagementRouteRecord,
  GuildManagementRouteRecord,
  LoginRouteRecord,
  NoPrivilegeRouteRecord,
  SystemManagementRouteRecord,
} from './route-records';

const MainRouteRecords = [
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
      globalStore.currentMenu = LoginRouteRecord.menu ?? null;
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
      if (!globalStore.userProfile.hasLoggedIn) {
        next('/login');
        return;
      }
      if (menu.roles && !menu.roles.includes(globalStore.userProfile.role!)) {
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
        next('/login');
        return;
      }
      const firstMenu = globalStore.menus[0];
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
    await router.push('/login');
  } catch (err) {
    console.error('Navigation failed:', err);
  }
}

export default router;
