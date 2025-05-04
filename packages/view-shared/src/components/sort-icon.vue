<script setup lang="ts">
import type { TableV2SortOrder } from 'element-plus';

defineProps<{
  direction: TableV2SortOrder | undefined;
}>();
</script>

<template>
  <span
    class="caret-wrapper"
    :class="{
      'sort-caret-ascending': direction === 'asc',
      'sort-caret-descending': direction === 'desc',
    }"
  >
    <i class="sort-caret ascending"></i>
    <i class="sort-caret descending"></i>
  </span>
</template>

<style lang="scss" scoped>
.caret-wrapper {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  height: 14px;
  overflow: initial;
  position: relative;
  vertical-align: middle;
  width: 24px;
  @include mobile {
    height: 12px;
    width: 20px;
  }
  .sort-caret {
    border: 5px solid transparent;
    height: 0;
    left: 7px;
    position: absolute;
    width: 0;
    @include mobile {
      border-width: 4px;
      left: 6px;
    }
    &.ascending {
      border-bottom-color: var(--el-text-color-placeholder);
      top: -4px;
      @include mobile {
        top: -3px;
      }
    }
    &.descending {
      border-top-color: var(--el-text-color-placeholder);
      bottom: -4px;
      @include mobile {
        bottom: -3px;
      }
    }
  }
  &.sort-caret-ascending {
    .sort-caret.ascending {
      border-bottom-color: var(--el-color-primary);
    }
  }
  &.sort-caret-descending {
    .sort-caret.descending {
      border-top-color: var(--el-color-primary);
    }
  }
}
</style>
