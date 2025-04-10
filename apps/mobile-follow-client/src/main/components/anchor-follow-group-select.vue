<script setup lang="ts">
import type { Area } from '@tk-crawler/biz-shared';
import { ElOption, ElSelect } from 'element-plus';
import { debounce } from 'lodash';
import { computed, onActivated, ref } from 'vue';
import { useGetFollowGroupList } from '../hooks';

defineOptions({
  name: 'AnchorFollowGroupSelect',
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    orgId: string;
  }>(),
  {
    placeholder: '请选择分组',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
  change: [value: string | undefined];
}>();

const filterText = ref<string>('');
const debouncedFilterText = ref<string>('');
const debounceHandleFilterText = debounce(() => {
  debouncedFilterText.value = filterText.value.trim();
}, 300);
function handleFilter(query: string) {
  filterText.value = query;
  debounceHandleFilterText();
}

function handleChange(value: Area) {
  emit('change', value);
}

const value = computed<string | undefined>({
  get() {
    return props.modelValue;
  },
  set(newValue: string | undefined) {
    emit('update:modelValue', newValue);
  },
});

const pageNum = 1;
const pageSize = 100;

const { data, isLoading, refetch } = useGetFollowGroupList({
  orgId: props.orgId,
  pageNum,
  pageSize,
  filter: computed(() => ({
    search: debouncedFilterText.value,
  })),
});

const options = computed(() => {
  return data.value?.list ?? [];
});
onActivated(refetch);
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
    :placeholder="placeholder"
    filterable
    :loading="isLoading"
    :filter-method="handleFilter"
    :reserve-keyword="false"
    @change="handleChange"
  >
    <ElOption
      v-for="option in options"
      :key="option.id"
      :label="option.name"
      :value="option.id"
    />
  </ElSelect>
</template>
