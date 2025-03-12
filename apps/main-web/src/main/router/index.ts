import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { Menu } from '../types';
import { getGlobalStore } from '../utils';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../sections/login/index.vue'),
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      await globalStore.init();
      if (globalStore.userProfile.hasLoggedIn) {
        next('/');
        return;
      }
      globalStore.currentMenu = Menu.Login;
      next();
    },
  },
  {
    path: '/',
    redirect: '/entry',
    beforeEnter: async (to, from, next) => {
      const globalStore = getGlobalStore();
      await globalStore.init();
      if (!globalStore.userProfile.hasLoggedIn) {
        next('/login');
        return;
      }
      next();
    },
    children: [
      {
        path: '/entry',
        name: 'Entry',
        component: () => import('../sections/entry/index.vue'),
        beforeEnter: async (to, from, next) => {
          const globalStore = getGlobalStore();
          globalStore.currentMenu = Menu.Entry;
          next();
        },
      },
      // {
      //   path: '/abc',
      //   name: 'Abc',
      //   component: () => import('../sections/entry/index.vue'),
      //   beforeEnter: async (to, from, next) => {
      //     const globalStore = getGlobalStore();
      //     globalStore.currentMenu = 'ABC' as any;
      //     next();
      //   },
      // },
    ],
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
