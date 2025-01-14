<script setup lang="ts">
import TopBar from './top-bar/index.vue';

defineOptions({
  name: 'Homepage',
});
</script>

<template>
  <div class="homepage">
    <TopBar />
    <div class="body">123</div>
  </div>
</template>

<style scoped>
.homepage {
  position: relative;
  overflow: hidden;
  margin-top: var(--top-bar-height);
  width: 100%;
  height: 100%;
}
.body {
  height: calc(100% - var(--top-bar-height));
  width: 100%;
  overflow: hidden;
  padding: 2rem;
}
</style>
