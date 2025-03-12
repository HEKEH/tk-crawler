<script setup lang="ts">
import { Setting, SwitchButton, User } from '@element-plus/icons-vue';
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessageBox,
} from 'element-plus';
import { useRouter } from 'vue-router';
import Avatar from '../../../components/avatar.vue';
import { useGlobalStore } from '../../../utils';

const globalStore = useGlobalStore();
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
  <ElDropdown
    trigger="hover"
    :hide-on-click="false"
    popper-class="avatar-dropdown-menu"
  >
    <div class="avatar-wrapper">
      <Avatar :size="32" url="/default-avatar.jpeg" />
    </div>

    <template #dropdown>
      <ElDropdownMenu>
        <!-- <ElDropdownItem>
          <el-icon><User /></el-icon>
          <span>个人主页</span>
        </ElDropdownItem>
        <ElDropdownItem>
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </ElDropdownItem> -->
        <ElDropdownItem @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<style scoped>
.avatar-wrapper {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.2);
}

.avatar-dropdown-menu {
  :global(.el-popper__arrow) {
    display: none !important;
  }
}
</style>
