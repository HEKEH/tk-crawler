<script setup lang="ts">
import { ElEmpty } from 'element-plus';

defineOptions({
  name: 'NoPrivilege',
});
</script>

<template>
  <div class="outer-container">
    <ElEmpty description="您没有权限访问此页面" />
  </div>
</template>

<style scoped>
.outer-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
