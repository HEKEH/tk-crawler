<script setup lang="ts">
import DownloadSection from './download-section.vue';
import FeaturesSection from './features-section.vue';
import HeroSection from './hero-section.vue';

defineOptions({
  name: 'Home',
});
</script>

<template>
  <div class="w-full h-full overflow-y-auto md:pb-8">
    <HeroSection />
    <FeaturesSection />
    <DownloadSection />
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
