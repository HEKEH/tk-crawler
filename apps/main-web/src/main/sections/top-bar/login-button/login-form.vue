<script setup lang="ts">
import type { OrgMemberLoginRequest } from '@tk-crawler/biz-shared';
import type { FormInstance, FormItemRule } from 'element-plus';
import { Lock, User } from '@element-plus/icons-vue';
import { validatePassword } from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElButton, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../../utils';

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error'): void;
}>();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const globalStore = useGlobalStore();
const router = useRouter();
// 表单数据
const loginForm = reactive<OrgMemberLoginRequest>({
  username: '',
  password: '',
});

// 表单验证规则
const rules: Record<string, FormItemRule[]> = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符' },
    {
      validator: (rule, value, callback) => {
        if (value && value.includes(' ')) {
          callback(new Error('名字不要有空格'));
          return;
        }
        callback();
      },
    },
  ],
  password: [
    { required: true, message: '请输入密码' },
    {
      validator: (rule, value, callback) => {
        const result = validatePassword(value);
        if (!result.isValid) {
          callback(new Error(result.error));
        } else {
          callback();
        }
      },
    },
  ],
};

// 处理登录
async function handleLogin() {
  if (!loginFormRef.value) {
    return;
  }

  try {
    // 表单验证
    await loginFormRef.value.validate();

    loading.value = true;

    const resp = await globalStore.login(loginForm);
    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
      ElMessage.success('登录成功');
      const primaryMenu = globalStore.primaryMenu;
      router.push(primaryMenu.jumpTo || primaryMenu.path);
      emit('success');
    } else {
      emit('error');
    }
  } catch {
    emit('error');
  } finally {
    loading.value = false;
  }
}

const isWeb = useIsWebSize();
</script>

<template>
  <ElForm
    ref="loginFormRef"
    :model="loginForm"
    :rules="rules"
    label-width="0"
    @keyup.enter="handleLogin"
  >
    <!-- 用户名输入框 -->
    <ElFormItem prop="username">
      <ElInput
        v-model="loginForm.username"
        :size="isWeb ? 'large' : 'default'"
        placeholder="请输入用户名"
        :prefix-icon="User"
      />
    </ElFormItem>

    <!-- 密码输入框 -->
    <ElFormItem prop="password">
      <ElInput
        v-model="loginForm.password"
        :size="isWeb ? 'large' : 'default'"
        type="password"
        placeholder="请输入密码"
        :prefix-icon="Lock"
        show-password
      />
    </ElFormItem>

    <!-- <ElFormItem>
          <div class="login-options">
            <ElLink type="primary" underline="never">忘记密码？</ElLink>
          </div>
        </ElFormItem> -->

    <!-- 登录按钮 -->
    <ElFormItem>
      <ElButton
        type="primary"
        :size="isWeb ? 'large' : 'default'"
        :loading="loading"
        class="login-button"
        @click="handleLogin"
      >
        登录
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style lang="scss" scoped>
.login-button {
  margin-top: 10px;
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
