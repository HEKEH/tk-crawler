<script setup lang="ts">
import { type Area, OrgMemberRole } from '@tk-crawler/biz-shared';
import { ElOption, ElSelect, ElTag } from 'element-plus';
import { computed, ref } from 'vue';
import { useGetOrgMemberList } from '../hooks';
import { useGlobalStore } from '../utils';

defineOptions({
  name: 'OrgMemberSelectSingle',
});
const props = withDefaults(
  defineProps<{
    modelValue?: PropsValue;
    placeholder?: string;
    showAll?: boolean;
    clearable?: boolean;
  }>(),
  {
    placeholder: '请选择用户',
    showAll: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: PropsValue | undefined];
  change: [value: PropsValue | undefined];
}>();

const globalStore = useGlobalStore();

type PropsValue = string | 'all';

const filterText = ref<string>();

function handleFilter(query: string) {
  filterText.value = query;
}

function handleChange(value: Area) {
  emit('change', value);
}

const value = computed<PropsValue | undefined>({
  get() {
    return props.modelValue;
  },
  set(newValue: PropsValue | undefined) {
    emit('update:modelValue', newValue);
  },
});

const filter = computed(() => ({
  display_name: filterText.value?.trim() || undefined,
}));

const { data: orgMembers, isLoading } = useGetOrgMemberList(
  {
    pageNum: 1,
    pageSize: 1000,
    filter,
  },
  globalStore.token,
);

const showOptions = computed<
  {
    label: string;
    value: PropsValue;
    role?: OrgMemberRole;
  }[]
>(() => {
  const options =
    orgMembers.value?.list.map(item => ({
      label: item.display_name,
      value: item.id,
      role: item.role_id,
    })) ?? [];
  if (props.showAll) {
    return [{ label: '全部', value: 'all' }, ...options];
  }
  return options;
});
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
    :placeholder="placeholder"
    filterable
    :filter-method="handleFilter"
    :reserve-keyword="false"
    :loading="isLoading"
    :clearable="clearable"
    @change="handleChange"
  >
    <ElOption
      v-for="option in showOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      <div class="option">
        {{ option.label }}
        <ElTag
          v-if="option.role"
          size="small"
          :type="option.role === OrgMemberRole.admin ? 'primary' : 'info'"
        >
          {{ option.role === OrgMemberRole.admin ? '管理员' : '普通成员' }}
        </ElTag>
      </div>
    </ElOption>
  </ElSelect>
</template>

<style scoped>
.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 0.25rem;
}
</style>
