<script setup lang="ts">
import { ANCHORS_DOWNLOAD_SIZE_LIMIT } from '@tk-crawler/biz-shared';
import { useIsWeb } from '@tk-crawler/view-shared';
import { ElInputNumber } from 'element-plus';
import { ref } from 'vue';

interface Props {
  value?: number | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', type: number | undefined): void;
}>();

const count = ref<number | undefined>(props.value);

function handleUpdate(val: number | undefined | null) {
  count.value = val || undefined;
  emit('update', count.value);
}
const isWeb = useIsWeb();
</script>

<template>
  <div class="container">
    <p class="dialog-title">
      最大导出数量为
      {{ ANCHORS_DOWNLOAD_SIZE_LIMIT }} 条，可能需要较长时间，是否继续？
    </p>

    <div class="input-container">
      <ElInputNumber
        style="width: 100%"
        :size="isWeb ? 'default' : 'small'"
        placeholder="输入导出数量，如果不填则导出所有数据"
        :model-value="count"
        :min="1"
        :max="ANCHORS_DOWNLOAD_SIZE_LIMIT"
        @update:model-value="handleUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 8px 0;
}

.dialog-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.input-container {
  width: 100%;
}
</style>
