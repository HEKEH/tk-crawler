<script setup lang="ts">
import type { AnchorCommentTemplateGroup } from '@tk-crawler/biz-shared';
import { useGlobalStore } from '../../../../utils/vue';

defineOptions({
  name: 'AnchorCommentTemplateTable',
});

const props = defineProps<{
  templateGroup: AnchorCommentTemplateGroup;
}>();

const globalStore = useGlobalStore();
</script>

<template>
  <div>{{ props.templateGroup.name }}</div>
</template>
