<script setup lang="ts">
import { ElButton } from 'element-plus';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../utils';
import LoginDialog from '../top-bar/login-button/login-dialog.vue';

const globalStore = useGlobalStore();

const hasLoggedIn = computed(() => globalStore.userProfile.hasLoggedIn);

const router = useRouter();

const dialogVisible = ref(false);

function handleDialogClose() {
  dialogVisible.value = false;
}

function handleLoginSuccess() {
  dialogVisible.value = false;
}

function handleLoginError() {}

function handleButtonClick() {
  if (hasLoggedIn.value) {
    router.push(globalStore.primaryMenu.jumpTo ?? globalStore.primaryMenu.path);
  } else {
    dialogVisible.value = true;
  }
}
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-content-left">
        <div class="hero-subtitle">高效精准联动主播，助力公会成长</div>
        <h1 class="hero-heading">
          限时 <span class="highlight">免费体验</span>
        </h1>
      </div>
      <div class="hero-content-right">
        <div class="hero-description">
          打造专业的主播联动平台，每日更新海量最新主播数据，提供自动建联工具，助您实现高效精准对接。限时免费体验，加速业务增长，让每一次建联都创造最大价值。
        </div>
        <ElButton
          class="start-button"
          type="primary"
          size="large"
          @click="handleButtonClick"
        >
          {{ hasLoggedIn ? '现在开始' : '立即登录' }}
        </ElButton>
      </div>
    </div>
    <div class="hero-image-container">
      <img src="/images/iphone.png" height="600" alt="Iphone" />
    </div>
  </section>
  <LoginDialog
    v-if="!hasLoggedIn"
    :visible="dialogVisible"
    @close="handleDialogClose"
    @success="handleLoginSuccess"
    @error="handleLoginError"
  />
</template>

<style lang="scss" scoped>
.hero-section {
  display: flex;
  padding: 60px 80px 0 80px;
  flex-direction: column;
  position: relative;
  min-height: 800px;

  .hero-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    z-index: 1;

    .hero-content-left {
      .hero-subtitle {
        font-size: 20px;
        color: var(--el-text-color-primary);
        margin-bottom: 32px;
      }

      .hero-heading {
        font-size: 80px;
        line-height: 1.1;
        font-weight: 500;
        margin-bottom: 0;
        letter-spacing: 1px;

        .highlight {
          color: #a3d100;
        }
      }
    }

    .hero-content-right {
      flex: 1;
      max-width: 525px;

      .hero-description {
        font-size: 18px;
        color: var(--el-text-color-primary);
        margin-bottom: 24px;
        line-height: 1.7;
      }

      .start-button {
        background: #c6f200 !important;
        border-color: #c6f200 !important;
        color: var(--el-text-color-primary);
        font-weight: 600;
        font-size: 20px;
        height: 56px;
        padding-left: 20px;
        padding-right: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 8px #e6f7b0;
      }
    }
  }

  .hero-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 200px;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
