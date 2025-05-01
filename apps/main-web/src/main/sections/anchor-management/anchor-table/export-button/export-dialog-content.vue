<script setup lang="ts">
import { ANCHORS_DOWNLOAD_SIZE_LIMIT } from '@tk-crawler/biz-shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
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
const isWeb = useIsWebSize();
</script>

<template>
  <div class="dialog-container">
    <p class="dialog-title">
      您最多可以导出
      {{ ANCHORS_DOWNLOAD_SIZE_LIMIT }}
      条数据。如果数据量较大，导出过程可能需要几分钟时间，请耐心等待。您确定要继续吗？
    </p>

    <div class="input-container">
      <ElInputNumber
        style="width: 100%; max-width: 300px"
        :precision="0"
        :controls="false"
        :size="isWeb ? 'default' : 'small'"
        placeholder="请输入导出条数（留空则导出全部数据）"
        :model-value="count"
        :min="1"
        :max="ANCHORS_DOWNLOAD_SIZE_LIMIT"
        @update:model-value="handleUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.dialog-container {
  padding: 8px 0;
}

.dialog-title {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.input-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
