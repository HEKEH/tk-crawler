<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue';
import { TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { ElIcon, ElTag, ElTooltip } from 'element-plus';
import { computed } from 'vue';
import { getStatusTagType, getStatusText, getStatusTip } from './utils';

const props = defineProps<{
  status: TKGuildUserStatus;
}>();

const type = computed(() => getStatusTagType(props.status));
const text = computed(() => getStatusText(props.status));
const tip = computed(() => getStatusTip(props.status));
</script>

<template>
  <ElTag class="status-tag" :type="type">
    {{ text }}
    <ElTooltip v-if="tip" :content="tip" placement="top">
      <ElIcon class="status-tag-icon" :size="12">
        <InfoFilled />
      </ElIcon>
    </ElTooltip>
  </ElTag>
</template>

<style scoped>
.status-tag {
  width: 100%;
  :global(.el-tag__content) {
    display: flex;
    align-items: center;
    column-gap: 4px;
  }
}
</style>
