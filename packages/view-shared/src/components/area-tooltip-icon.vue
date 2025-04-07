<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue';
import { type Area, AREA_DESCRIPTION_MAP } from '@tk-crawler/biz-shared';
import { ElIcon, ElTooltip } from 'element-plus';
import { computed } from 'vue';

defineOptions({
  name: 'AreaTooltipIcon',
});

const props = defineProps<{
  area: Area;
}>();

const description = computed(() => AREA_DESCRIPTION_MAP[props.area]);
</script>

<template>
  <ElTooltip
    v-if="description"
    popper-style="max-width: 200px;"
    :content="description"
    placement="top"
    effect="light"
  >
    <ElIcon class="info-icon"><InfoFilled /></ElIcon>
  </ElTooltip>
</template>

<style scoped>
.info-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
}
</style>
