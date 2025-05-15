import { ElLoading } from 'element-plus';
import { defineAsyncComponent } from 'vue';

const ClientManage = defineAsyncComponent({
  loader: () => import('./index.vue'),
  timeout: 3000,
  loadingComponent: () => ElLoading,
});

export { ClientManage };
