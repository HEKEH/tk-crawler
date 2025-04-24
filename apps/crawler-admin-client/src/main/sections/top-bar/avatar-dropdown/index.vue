<script setup lang="ts">
import type { OrgMemberChangePasswordRequest } from '@tk-crawler/biz-shared';
import { SwitchButton } from '@element-plus/icons-vue';
import { useQueryClient } from '@tanstack/vue-query';
// import { useRouter } from 'vue-router';
import { KeyIcon } from '@tk-crawler/assets';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import {
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElMessageBox,
} from 'element-plus';
import { computed, ref } from 'vue';
import { Avatar } from '../../../components';
import { changePassword } from '../../../requests';
import { useGlobalStore } from '../../../utils';
import PasswordChangeDialog from './password-change-dialog/index.vue';

const globalStore = useGlobalStore();
const userProfile = computed(() => globalStore.userProfile);
const userInfo = computed(() => userProfile.value.userInfo!);
// const router = useRouter();
const queryClient = useQueryClient();

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return;
  }
  // 清空所有的swr请求缓存
  await queryClient.invalidateQueries();
  await globalStore.logout();
  // router.push('/login');
}
const passwordChangeDialogVisible = ref(false);
async function handlePasswordChange(data: OrgMemberChangePasswordRequest) {
  const result = await changePassword(data, globalStore.token);
  if (result.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success('修改密码成功');
    passwordChangeDialogVisible.value = false;
  }
}
</script>

<template>
  <ElDropdown trigger="hover" popper-class="avatar-dropdown-menu">
    <div class="avatar-wrapper">
      <Avatar :size="32" />
    </div>

    <template #dropdown>
      <div class="dropdown-content">
        <div class="user-info">
          <Avatar :size="28" />
          <div class="user-details">
            <div class="username">{{ userInfo.username }}</div>
          </div>
        </div>

        <ElDivider />
        <ElDropdownMenu>
          <ElDropdownItem @click="passwordChangeDialogVisible = true">
            <ElIcon><KeyIcon /></ElIcon>
            <span>修改密码</span>
          </ElDropdownItem>
          <ElDropdownItem @click="handleLogout">
            <ElIcon><SwitchButton /></ElIcon>
            <span>退出登录</span>
          </ElDropdownItem>
        </ElDropdownMenu>
      </div>
    </template>
  </ElDropdown>
  <PasswordChangeDialog
    :visible="passwordChangeDialogVisible"
    :submit="handlePasswordChange"
    @close="passwordChangeDialogVisible = false"
  />
</template>

<style scoped>
.avatar-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.avatar-wrapper:hover {
  transform: scale(1.2);
}

.avatar-dropdown-menu {
  :global(.el-popper__arrow) {
    display: none !important;
  }
  :global(.el-divider--horizontal) {
    margin: 12px 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
  :global(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    font-size: 14px;
  }

  :global(.el-dropdown-menu__item:hover) {
    background-color: var(--el-dropdown-menuItem-hover-fill);
    color: var(--el-color-primary);
  }

  :global(.el-dropdown-menu__item .el-icon) {
    font-size: 16px;
    margin-right: 4px;
  }

  :global(.el-divider) {
    background-color: var(--el-border-color-lighter);
  }
}

.dropdown-content {
  padding: 16px;
  width: fit-content;
}

.user-info {
  display: flex;
  gap: 16px;
  padding: 8px;
  .user-details {
    flex: 1;
    display: flex;
    align-items: center;
  }
}

.username {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  padding-left: 4px;
}
</style>
