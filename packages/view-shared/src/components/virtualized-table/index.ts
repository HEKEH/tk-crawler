import { defineAsyncComponent } from 'vue';

const VirtualizedTable = defineAsyncComponent(() => import('./index.vue'));

export { VirtualizedTable };
export * from './types';
