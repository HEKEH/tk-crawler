<script setup lang="ts">
import MacIcon from '../../assets/icons/mac.svg';
import WindowsIcon from '../../assets/icons/windows.svg';
import { getAppDownloadUrl } from '../../utils';

const downloadButtons = [
  {
    platform: 'Windows',
    icon: WindowsIcon,
    url: getAppDownloadUrl('Windows'),
  },
  {
    platform: 'macOS',
    icon: MacIcon,
    url: getAppDownloadUrl('Mac'),
  },
];
</script>

<template>
  <section class="download-section">
    <div class="download-content">
      <div class="download-info">
        <div class="download-title">小橙助手桌面客户端</div>
        <div class="download-description">
          下载桌面客户端，体验更强大的功能，让工作更高效
        </div>
      </div>
      <div class="download-buttons">
        <a
          v-for="button in downloadButtons"
          :key="button.platform"
          class="download-button"
          :href="button.url"
          target="_blank"
        >
          <component :is="button.icon" :width="40" :height="40" />
          <span>{{ button.platform }}</span>
        </a>
      </div>
    </div>
    <div class="download-image">
      <img src="/images/computer.png" height="500" alt="computer" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.download-section {
  background-color: var(--el-bg-color-page);
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px;

  .download-content {
    padding-left: 60px;

    .download-info {
      display: flex;
      flex-direction: column;
      row-gap: 16px;
      margin-bottom: 40px;

      .download-title {
        color: #a8cc00;
        font-size: 36px;
        font-weight: 600;
      }

      .download-description {
        font-size: 18px;
        color: var(--el-text-color-secondary);
        margin-top: 16px;
      }
    }

    .download-buttons {
      display: flex;
      flex-direction: row;
      gap: 20px;

      .download-button {
        align-items: center;
        background-color: var(--el-bg-color);
        border-radius: 50%;
        color: var(--el-text-color-primary);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        font-size: 14px;
        height: 120px;
        width: 120px;
        justify-content: center;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
          background-color: var(--el-bg-color-overlay);
          transform: translateY(-2px);
        }

        svg {
          width: 40px;
          height: 40px;
          margin-bottom: 8px;
        }
      }
    }
  }

  .download-image {
    img {
      height: 500px;
      object-fit: contain;
    }
  }
}
</style>
