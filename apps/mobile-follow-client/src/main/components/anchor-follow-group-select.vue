<script setup lang="ts">
import type {
  Area,
  GetAnchorFollowGroupListResponseData,
} from '@tk-crawler/biz-shared';
import { useQuery } from '@tanstack/vue-query';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElOption, ElSelect } from 'element-plus';
import { debounce } from 'lodash';
import { computed, onActivated, ref } from 'vue';
import { getAnchorFollowGroupList } from '../requests';

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

const filterText = ref<string>();
const debouncedFilterText = ref<string>();
const debounceHandleFilterText = debounce(() => {
  debouncedFilterText.value = filterText.value?.trim();
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

const { data, isLoading, refetch } = useQuery<
  GetAnchorFollowGroupListResponseData | undefined
>({
  queryKey: [
    'all-anchor-follow-groups',
    props.orgId,
    pageNum,
    pageSize,
    filterText,
  ],
  retry: false,
  queryFn: async () => {
    const response = await getAnchorFollowGroupList({
      org_id: props.orgId,
      page_num: pageNum,
      page_size: pageSize,
    });
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
  },
  placeholderData: previousData => previousData,
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
