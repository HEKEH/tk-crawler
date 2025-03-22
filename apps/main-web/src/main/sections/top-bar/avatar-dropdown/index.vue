<script setup lang="ts">
import {
  Message,
  OfficeBuilding,
  Phone,
  SwitchButton,
} from '@element-plus/icons-vue';
import { OrgMemberRole } from '@tk-crawler/biz-shared';
import {
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessageBox,
  ElTag,
} from 'element-plus';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from '../../../components/avatar.vue';
import { MembershipStatus } from '../../../domain/user-profile';
import { useGlobalStore } from '../../../utils';

const globalStore = useGlobalStore();
const userProfile = computed(() => globalStore.userProfile);
const userInfo = computed(() => userProfile.value.userInfo!);
const orgInfo = computed(() => userProfile.value.orgInfo!);
const router = useRouter();

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
  await globalStore.logout();
  router.push('/login');
}
</script>

<template>
  <ElDropdown trigger="hover" popper-class="avatar-dropdown-menu">
    <div class="avatar-wrapper">
      <Avatar :size="32" url="/default-avatar.jpeg" />
    </div>

    <template #dropdown>
      <div class="dropdown-content">
        <div class="user-info">
          <Avatar :size="36" url="/default-avatar.jpeg" />
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
            <span>{{ userInfo.email || '未绑定' }}</span>
          </div>
          <div class="info-item">
            <ElIcon><Phone /></ElIcon>
            <span>{{ userInfo.mobile || '未绑定' }}</span>
          </div>
        </div>

        <ElDivider />
        <ElDropdownMenu>
          <!-- <ElDropdownItem>
            <ElIcon><User /></ElIcon>
            <span>个人主页</span>
          </ElDropdownItem>
          <ElDropdownItem>
            <ElIcon><Setting /></ElIcon>
            <span>设置</span>
          </ElDropdownItem> -->
          <ElDropdownItem @click="handleLogout">
            <ElIcon><SwitchButton /></ElIcon>
            <span>退出登录</span>
          </ElDropdownItem>
        </ElDropdownMenu>
      </div>
    </template>
  </ElDropdown>
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
}

.dropdown-content {
  padding: 16px;
  width: fit-content;
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
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  padding-left: 4px;
}

.role {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1;
}

.quick-info {
  padding: 4px 0;
}

.info-item {
  align-items: center;
  color: var(--el-text-color-regular);
  display: flex;
  font-size: var(--el-font-size-base);
  line-height: 22px;
  list-style: none;
  margin: 0;
  outline: none;
  padding: 5px 16px;
  white-space: nowrap;
  transition: all 0.3s ease;
  gap: 8px;
  :global(.el-icon) {
    font-size: 16px;
    margin-right: 4px;
  }
}

.info-item:hover {
  color: var(--el-text-color-primary);
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
</style>
