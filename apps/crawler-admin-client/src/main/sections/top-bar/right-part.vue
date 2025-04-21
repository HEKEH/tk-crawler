<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../../utils';
import AvatarDropdown from './avatar-dropdown/index.vue';

defineOptions({
  name: 'RightPart',
});

const globalStore = useGlobalStore();
const hasLoggedIn = computed(() => globalStore.userProfile.hasLoggedIn);
</script>

<template>
  <div class="right-part">
    <template v-if="hasLoggedIn">
      <AvatarDropdown />
    </template>
  </div>
</template>

<style scoped>
.right-part {
  height: 100%;
  display: flex;
  align-items: center;
  column-gap: 3rem;

  .right-part-item {
    font-size: 1rem;
    &.active {
      color: var(--el-color-primary);
    }
  }
}
</style>
