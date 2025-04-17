<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue';
import { TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { ElIcon, ElTag, ElTooltip } from 'element-plus';
import { computed } from 'vue';

const props = defineProps<{
  status: TKGuildUserStatus;
}>();

// 获取状态标签类型
function getStatusTagType(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return 'success';
    case TKGuildUserStatus.STOPPED:
      return 'info';
    case TKGuildUserStatus.ERROR:
      return 'danger';
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return 'danger';
    case TKGuildUserStatus.WAITING:
      return 'primary';
    case TKGuildUserStatus.INACTIVE:
      return 'info';
    case TKGuildUserStatus.WARNING:
      return 'warning';
    default:
      return 'info';
  }
}

// 获取状态显示文本
function getStatusText(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return '运行中';
    case TKGuildUserStatus.STOPPED:
      return '已停止';
    case TKGuildUserStatus.ERROR:
      return '出错';
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return 'Cookie过期';
    case TKGuildUserStatus.WAITING:
      return '等待中';
    case TKGuildUserStatus.INACTIVE:
      return '未激活';
    case TKGuildUserStatus.WARNING:
      return '有警告';
    default:
      return '未知';
  }
}

function getTip(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return '由于TK严格的风控机制，有时候一次激活并不能免除后续验证，此时可能需要重复激活数次后，Cookie才能正常使用';
    default:
      return undefined;
  }
}

const type = computed(() => getStatusTagType(props.status));
const text = computed(() => getStatusText(props.status));
const tip = computed(() => getTip(props.status));
</script>

<template>
  <ElTag class="status-tag" :type="type">
    {{ text }}
    <ElTooltip v-if="tip" :content="tip" placement="top">
      <ElIcon :size="12" class="ml-1">
        <InfoFilled />
      </ElIcon>
    </ElTooltip>
  </ElTag>
</template>

<style scoped>
.status-tag {
  display: flex;
  align-items: center;
}
</style>
