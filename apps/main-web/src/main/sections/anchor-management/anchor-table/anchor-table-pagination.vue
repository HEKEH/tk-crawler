<script setup lang="tsx">
import { ANCHOR_LIST_QUERY_COUNT_LIMIT } from '@tk-crawler/biz-shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElPagination } from 'element-plus';
import { computed } from 'vue';

defineOptions({
  name: 'TKAnchorTablePagination',
});

const props = withDefaults(
  defineProps<{
    pageNum?: number;
    pageSize?: number;
    total?: number;
  }>(),
  {
    pageNum: 1,
    pageSize: 10,
    total: 0,
  },
);

const emit = defineEmits<{
  (e: 'update:pageNum', value: number): void;
  (e: 'update:pageSize', value: number): void;
}>();

const isWebSize = useIsWebSize();

function handlePageNumChange(_pageNum: number) {
  emit('update:pageNum', _pageNum);
}

function handlePageSizeChange(_pageSize: number) {
  emit('update:pageSize', _pageSize);
}
const totalText = computed(() => {
  return props.total < ANCHOR_LIST_QUERY_COUNT_LIMIT
    ? `共 ${props.total} 条`
    : `≥ ${ANCHOR_LIST_QUERY_COUNT_LIMIT} 条`;
});
</script>

<template>
  <div class="pagination-row">
    <span class="pagination-total">{{ totalText }}</span>
    <ElPagination
      :current-page="pageNum"
      :page-size="pageSize"
      size="small"
      background
      layout="sizes, prev, pager, next"
      :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
      :pager-count="isWebSize ? 7 : 3"
      :total="total ?? 0"
      @size-change="handlePageSizeChange"
      @current-change="handlePageNumChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.pagination-row {
  width: 100%;
  display: flex;
  margin-top: 1rem;
  @include mobile {
    justify-content: center;
  }
  @include web {
    justify-content: flex-end;
    padding-right: 1rem;
  }
  .pagination-total {
    font-size: 12px;
    margin-right: 1rem;
    line-height: 24px;
    color: var(--el-text-color-regular);
    font-weight: normal;
    white-space: nowrap;
    @include mobile {
      margin-right: 8px;
    }
  }
}
</style>
