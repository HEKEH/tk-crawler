import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { getGlobalStore } from '../utils';
import { LoginRouteRecord, SystemManagementRouteRecord } from './route-records';

const routes: RouteRecordRaw[] = [
  {
    path: LoginRouteRecord.path,
    name: LoginRouteRecord.name,
    component: LoginRouteRecord.component,
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      await globalStore.init();
      if (globalStore.userProfile.hasLoggedIn) {
        next('/');
        return;
      }
      globalStore.currentMenu = LoginRouteRecord.menu;
      next();
    },
  },
  {
    path: '/',
    redirect: () => {
      const globalStore = getGlobalStore();
      const firstMenu = globalStore.menus[0];
      if (firstMenu) {
        return firstMenu.path;
      }
      return '';
    },
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      await globalStore.init();
      if (!globalStore.userProfile.hasLoggedIn) {
        next('/login');
        return;
      }
      next();
    },
    children: [SystemManagementRouteRecord].map(menu => ({
      ...menu,
      beforeEnter: async (to, from, next) => {
        const globalStore = getGlobalStore();
        globalStore.currentMenu = menu.menu;
        next();
      },
    })),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export function redirectToLogin() {
  router.push('/login');
}

export default router;
