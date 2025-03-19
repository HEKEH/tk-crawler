<script setup lang="ts">
import AnchorCommentTemplateGroupTable from './anchor-comment-template-group/anchor-comment-template-group-table.vue';

defineOptions({
  name: 'GroupSection',
});
</script>

<template>
  <div class="anchor-comment-template-group-section">
    <AnchorCommentTemplateGroupTable class="table" />
  </div>
</template>

<style scoped>
.anchor-comment-template-group-section {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  row-gap: 1rem;
  .table {
    flex: 1;
  }
}
</style>
