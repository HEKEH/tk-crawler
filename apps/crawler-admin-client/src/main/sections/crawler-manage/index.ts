import { ElLoading } from 'element-plus';
import { defineAsyncComponent } from 'vue';

const CrawlerManage = defineAsyncComponent({
  loader: () => import('./index.vue'),
  timeout: 3000,
  loadingComponent: () => ElLoading,
});

export { CrawlerManage };
