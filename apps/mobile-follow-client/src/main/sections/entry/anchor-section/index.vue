<script setup lang="ts">
import { ElAlert, ElLink } from 'element-plus';
import { useGlobalStore } from '../../../utils/vue';
import AnchorTable from './anchor-table.vue';

defineOptions({
  name: 'AnchorSection',
});
const globalStore = useGlobalStore();
function goToCollectPage() {
  globalStore.goToCollectPage();
}
</script>

<template>
  <div class="anchor-section">
    <ElAlert class="tip" type="success" :closable="false">
      <template #default>
        如果页面数据不够，请先到
        <ElLink type="warning" @click="goToCollectPage"> 主播采集页 </ElLink>
        采集数据
      </template>
    </ElAlert>
    <AnchorTable class="anchor-table" />
  </div>
</template>

<style scoped>
.anchor-section {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  row-gap: 1rem;
  padding: 1rem 0.5rem 0.5rem 1rem;
  .tip {
    width: 100%;
    color: var(--el-text-color-secondary);
    text-align: center;
    :global(.el-alert__description) {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    :global(.el-link) {
      font-weight: bold;
    }
  }
  .anchor-table {
    flex: 1;
  }
}
</style>
