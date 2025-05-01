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

const routes: RouteRecordRaw[] = [
  {
    path: LoginRouteRecord.path,
    name: LoginRouteRecord.name,
    component: LoginRouteRecord.component,
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      await globalStore.init().catch(() => {
        // 错误不用处理，视图层会处理
      });
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

  {
    path: '/',
    redirect: () => {
      const globalStore = getGlobalStore();
      const firstMenu = globalStore.menus[0];
      if (firstMenu) {
        return firstMenu.jumpTo ?? firstMenu.path;
      }
      return '';
    },
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      await globalStore.init().catch(() => {
        // 错误不用处理，视图层会处理
      });
      if (!globalStore.userProfile.hasLoggedIn) {
        next('/login');
        return;
      }
      next();
    },
    children: [
      SystemManagementRouteRecord,
      GuildManagementRouteRecord,
      AnchorManagementRouteRecord,
    ].map(menu => ({
      ...menu,
      beforeEnter: async (to, from, next) => {
        const globalStore = getGlobalStore();
        if (menu.roles && !menu.roles.includes(globalStore.userProfile.role!)) {
          next(NoPrivilegeRouteRecord.path);
          return;
        }
        globalStore.currentMenu = menu.menu ?? null;
        next();
      },
    })),
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
