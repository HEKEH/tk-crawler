<script setup lang="ts">
import type { OrgMemberChangePasswordRequest } from '@tk-crawler/biz-shared';
import type { Settings } from '../../../hooks';
import { Setting, SwitchButton } from '@element-plus/icons-vue';
import { useQueryClient } from '@tanstack/vue-query';
// import { useRouter } from 'vue-router';
import { KeyIcon } from '@tk-crawler/assets';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { useIsWebSize, useVConsole } from '@tk-crawler/view-shared';
import {
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElSwitch,
} from 'element-plus';
import { computed, ref } from 'vue';
import { Avatar } from '../../../components';
import { useSettings } from '../../../hooks';
import { changePassword } from '../../../requests';
import { useGlobalStore } from '../../../utils';
import PasswordChangeDialog from './password-change-dialog/index.vue';
import SettingDialog from './setting-dialog/index.vue';

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
const settingDialogVisible = ref(false);
async function handlePasswordChange(data: OrgMemberChangePasswordRequest) {
  const result = await changePassword(data, globalStore.token);
  if (result.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success('修改密码成功');
    passwordChangeDialogVisible.value = false;
  }
}
const settings = useSettings();
function handleSetting(data: Settings) {
  settings.value = data;
  settingDialogVisible.value = false;
}
const isWebSize = useIsWebSize();
const { vConsoleOpen, toggleVConsoleOpen } = useVConsole();
const inElectronApp = isInElectronApp();
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
          <ElDropdownItem
            v-if="inElectronApp"
            @click="settingDialogVisible = true"
          >
            <ElIcon><Setting /></ElIcon>
            <span>设置</span>
          </ElDropdownItem>
          <ElDropdownItem @click="passwordChangeDialogVisible = true">
            <ElIcon><KeyIcon /></ElIcon>
            <span>修改密码</span>
          </ElDropdownItem>
          <ElDropdownItem @click="handleLogout">
            <ElIcon><SwitchButton /></ElIcon>
            <span>退出登录</span>
          </ElDropdownItem>
        </ElDropdownMenu>
        <ElDivider />
        <div class="info-item">
          <span class="mr-1">调试模式</span>
          <ElSwitch
            :model-value="vConsoleOpen"
            :size="isWebSize ? 'default' : 'small'"
            @update:model-value="toggleVConsoleOpen"
          />
        </div>
      </div>
    </template>
  </ElDropdown>
  <PasswordChangeDialog
    :visible="passwordChangeDialogVisible"
    :submit="handlePasswordChange"
    @close="passwordChangeDialogVisible = false"
  />
  <SettingDialog
    :visible="settingDialogVisible"
    :initial-values="settings"
    :submit="handleSetting"
    @close="settingDialogVisible = false"
  />
</template>

<style lang="scss" scoped>
.avatar-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.avatar-wrapper:hover {
  transform: scale(1.2);
}

:global(.avatar-dropdown-menu .el-popper__arrow) {
  display: none !important;
}
:global(.avatar-dropdown-menu .el-divider--horizontal) {
  margin: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
:global(.avatar-dropdown-menu .el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  font-size: 14px;
}

:global(.avatar-dropdown-menu .el-dropdown-menu__item:hover) {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: var(--el-color-primary);
}

:global(.avatar-dropdown-menu .el-dropdown-menu__item .el-icon) {
  font-size: 16px;
  margin-right: 4px;
}

.avatar-dropdown-menu {
  .dropdown-content {
    --font-size: 14px;

    .info-item {
      align-items: center;
      color: var(--el-text-color-regular);
      display: flex;
      font-size: var(--font-size);
      line-height: 22px;
      list-style: none;
      margin: 0;
      outline: none;
      padding: 5px 0;
      white-space: nowrap;
      transition: all 0.3s ease;
      gap: 8px;
      .el-icon {
        font-size: var(--font-size);
        margin-right: 4px;
      }
    }

    .info-item:hover {
      color: var(--el-text-color-primary);
    }
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
  min-width: 180px;
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
