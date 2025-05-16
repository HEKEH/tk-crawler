<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../../utils';
import AvatarDropdown from './avatar-dropdown/index.vue';
import ErrorReminder from './error-reminder.vue';

defineOptions({
  name: 'RightPart',
});

const globalStore = useGlobalStore();
const hasLoggedIn = computed(() => globalStore.userProfile.hasLoggedIn);
</script>

<template>
  <div class="h-full flex items-center gap-x-4 md:gap-x-6">
    <ErrorReminder />
    <template v-if="hasLoggedIn">
      <AvatarDropdown />
    </template>
    <!-- <ElLink
      class="right-part-item"
      underline="never"
      @click="globalStore.switchTikTokAccount()"
    >
      切换TikTok账号
    </ElLink> -->
  </div>
</template>
