<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../../utils';
import AvatarDropdown from './avatar-dropdown/index.vue';
import ErrorReminder from './error-reminder.vue';
import LoginButton from './login-button/index.vue';

defineOptions({
  name: 'RightPart',
});

const globalStore = useGlobalStore();
const hasLoggedIn = computed(() => globalStore.userProfile.hasLoggedIn);
</script>

<template>
  <div class="h-full flex items-center gap-x-4 md:gap-x-6">
    <template v-if="hasLoggedIn">
      <ErrorReminder />
      <AvatarDropdown />
    </template>
    <LoginButton v-else />
  </div>
</template>
