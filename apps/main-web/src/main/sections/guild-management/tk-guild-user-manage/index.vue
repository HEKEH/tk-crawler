<script setup lang="ts">
import { computed } from 'vue';
import { MembershipStatus } from '../../../domain/user-profile';
import { useGlobalStore } from '../../../utils';
import TKGuildUserTable from './guild-user-table.vue';

defineOptions({
  name: 'TKGuildUserManage',
});
const globalStore = useGlobalStore();
const membershipStatus = computed(() => {
  return globalStore.userProfile.membershipStatus;
});
const membershipStatusMessage = computed(() => {
  switch (membershipStatus.value) {
    case MembershipStatus.expired:
      return '您的会员已过期';
    case MembershipStatus.not_member:
      return '您当前不是会员';
    default:
      return '';
  }
});
</script>

<template>
  <TKGuildUserTable
    v-if="membershipStatus === MembershipStatus.has_membership"
  />
  <div v-else class="membership-status-message">
    {{ membershipStatusMessage }}
  </div>
</template>

<style scoped>
.membership-status-message {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding-top: 5rem;
  color: var(--el-color-danger);
}
</style>
