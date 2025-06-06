<script setup lang="ts">
import HeroSection from './hero-section.vue';

defineOptions({
  name: 'Home',
});
</script>

<template>
  <div class="w-full h-full overflow-y-auto pb-8">
    <HeroSection />
  </div>
</template>

<style scoped>
.home {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 20px;
}
</style>
