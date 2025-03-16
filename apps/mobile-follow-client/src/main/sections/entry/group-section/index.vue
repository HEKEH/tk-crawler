<script setup lang="ts">
import GroupTable from './group-table.vue';

defineOptions({
  name: 'GroupSection',
});
</script>

<template>
  <div class="group-section">
    <GroupTable class="group-table" />
  </div>
</template>

<style scoped>
.group-section {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  row-gap: 1rem;
  .group-table {
    flex: 1;
  }
}
</style>
