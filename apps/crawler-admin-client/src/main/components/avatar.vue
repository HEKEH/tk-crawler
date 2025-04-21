<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  /** Image URL for the avatar */
  url?: string;
  /** Size in pixels */
  size?: number;
  /** Alt text for accessibility */
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  // 目前没有加路由，可以使用相对路径。如果加路由，会有问题。但是加绝对路径，在生产环境也会报错。遇到问题时需要重新修改
  url: 'default-avatar.jpeg',
  size: 40,
  alt: '头像',
});

const hasError = ref(false);

const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));

function handleError() {
  hasError.value = true;
}
</script>

<template>
  <div class="avatar" :style="containerStyle">
    <img :src="url" :alt="alt" class="avatar-image" @error="handleError" />
  </div>
</template>

<style scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: #eee;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
