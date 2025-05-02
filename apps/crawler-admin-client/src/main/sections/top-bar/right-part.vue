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
  <div class="h-full flex items-center gap-x-12">
    <template v-if="hasLoggedIn">
      <AvatarDropdown />
    </template>
  </div>
</template>
