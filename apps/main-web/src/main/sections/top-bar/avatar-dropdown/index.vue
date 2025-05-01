<script setup lang="ts">
import type { OrgMemberChangePasswordRequest } from '@tk-crawler/biz-shared';
import {
  Message,
  OfficeBuilding,
  Phone,
  SwitchButton,
} from '@element-plus/icons-vue';
import { useQueryClient } from '@tanstack/vue-query';
import { KeyIcon } from '@tk-crawler/assets';
import { OrgMemberRole } from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElTag,
} from 'element-plus';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Avatar } from '../../../components';
import { MembershipStatus } from '../../../domain/user-profile';
import { changePassword } from '../../../requests';
import { useGlobalStore } from '../../../utils';
import PasswordChangeDialog from './password-change-dialog/index.vue';

const globalStore = useGlobalStore();
const userProfile = computed(() => globalStore.userProfile);
const userInfo = computed(() => userProfile.value.userInfo!);
const orgInfo = computed(() => userProfile.value.orgInfo!);
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
}
const passwordChangeDialogVisible = ref(false);
async function handlePasswordChange(data: OrgMemberChangePasswordRequest) {
  const result = await changePassword(data, globalStore.token);
  if (result.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success('修改密码成功');
    passwordChangeDialogVisible.value = false;
  }
}
const isWeb = useIsWebSize();
</script>

<template>
  <ElDropdown trigger="hover" popper-class="avatar-dropdown-menu">
    <div class="avatar-wrapper">
      <Avatar :size="isWeb ? 32 : 20" />
    </div>

    <template #dropdown>
      <div class="dropdown-content">
        <div class="user-info">
          <Avatar :size="isWeb ? 36 : 24" />
          <div class="user-details">
            <div class="username">{{ userInfo.display_name }}</div>
            <div class="role">
              <ElTag
                v-if="userInfo.role_id === OrgMemberRole.admin"
                type="success"
                size="small"
              >
                机构管理员
              </ElTag>
              <ElTag
                v-else-if="userInfo.role_id === OrgMemberRole.member"
                type="info"
                size="small"
              >
                机构普通用户
              </ElTag>
            </div>
          </div>
        </div>

        <ElDivider />

        <!-- 快捷信息区 -->
        <div class="quick-info">
          <div class="info-item">
            <ElIcon><OfficeBuilding /></ElIcon>
            <span>{{ orgInfo.name }}</span>
            <ElTag
              v-if="
                userProfile.membershipStatus === MembershipStatus.has_membership
              "
              type="success"
              size="small"
            >
              该机构已注册会员
            </ElTag>
            <ElTag
              v-else-if="
                userProfile.membershipStatus === MembershipStatus.not_member
              "
              type="info"
              size="small"
            >
              该机构尚未注册会员
            </ElTag>
            <ElTag
              v-else-if="
                userProfile.membershipStatus === MembershipStatus.expired
              "
              type="danger"
              size="small"
            >
              该机构会员已过期
            </ElTag>
          </div>
          <div class="info-item">
            <ElIcon><Message /></ElIcon>
            <span v-if="userInfo.email">{{ userInfo.email }}</span>
            <span style="color: var(--el-text-color-disabled)" v-else>
              未绑定
            </span>
          </div>
          <div class="info-item">
            <ElIcon><Phone /></ElIcon>
            <span v-if="userInfo.mobile">{{ userInfo.mobile }}</span>
            <span style="color: var(--el-text-color-disabled)" v-else>
              未绑定
            </span>
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

.avatar-dropdown-menu {
  .el-divider--horizontal {
    margin: 12px 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
  .dropdown-content {
    padding: 16px;
    width: fit-content;
    @include web {
      --font-size: 14px;
    }
    @include mobile {
      --font-size: 12px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .username {
    font-weight: 500;
    color: var(--el-text-color-primary);
    line-height: 1.2;
    padding-left: 4px;
    @include web {
      font-size: 16px;
    }
    @include mobile {
      font-size: 12px;
    }
  }

  .role {
    color: var(--el-text-color-secondary);
    line-height: 1;
    @include web {
      font-size: 13px;
    }
    @include mobile {
      font-size: 12px;
    }
  }

  .quick-info {
    padding: 4px 0;
  }

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
    :global(.el-icon) {
      font-size: var(--font-size);
      margin-right: 4px;
    }
  }

  .info-item:hover {
    color: var(--el-text-color-primary);
  }
}

:global(.avatar-dropdown-menu .el-popper__arrow) {
  display: none !important;
}

:global(.avatar-dropdown-menu .el-dropdown-menu__item) {
  font-size: var(--font-size) !important;
  display: flex;
  align-items: center;
  padding: 5px 0;
  gap: 8px;
}
:global(.avatar-dropdown-menu .el-dropdown-menu__item:hover) {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: var(--el-color-primary);
}
</style>
