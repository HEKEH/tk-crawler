<script setup lang="ts">
import { useIsMobileSize } from '@tk-crawler/view-shared';
import FeatureIcon1 from '../../assets/icons/feature-icon1.svg';
import FeatureIcon2 from '../../assets/icons/feature-icon2.svg';
import FeatureIcon3 from '../../assets/icons/feature-icon3.svg';

const features = [
  {
    icon: FeatureIcon1,
    title: '海量数据',
    description:
      '不间断智能采集直播数据，每日更新<span class="font-bold">30万+</span>实时主播数据，助您快速精准匹配目标主播',
  },
  {
    icon: FeatureIcon2,
    title: '极致体验',
    description:
      '一站式解决方案，简单易用，让您的工作更高效。我们还将持续优化产品，为您提供更好的服务',
  },
  {
    icon: FeatureIcon3,
    title: '智能建联',
    description:
      '智能建联工具，一键批量操作，让您快速建立主播联系，效率提升翻倍',
  },
];

const isMobile = useIsMobileSize();
</script>

<template>
  <section class="features-section">
    <h2 class="features-heading">小橙助手，您的智能工作伙伴</h2>
    <div class="features-grid">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="feature-card"
      >
        <div class="feature-icon">
          <component
            :is="feature.icon"
            :width="isMobile ? 40 : 56"
            :height="isMobile ? 40 : 56"
            :size="isMobile ? 40 : 56"
          />
        </div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <div class="feature-description" v-html="feature.description"></div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.features-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 0;

  @include mobile {
    padding: 60px 0;
  }

  .features-heading {
    text-align: center;
    font-size: 36px;
    margin-bottom: 67px;
    color: var(--el-text-color-primary);

    @include mobile {
      font-size: 24px;
      margin-bottom: 40px;
    }
  }

  .features-grid {
    width: 100%;
    display: flex;
    column-gap: 40px;
    justify-content: space-between;
    flex-wrap: nowrap;
    padding-left: 20px;
    padding-right: 20px;

    @include mobile {
      flex-direction: column;
      gap: 24px;
      padding-bottom: 0;
    }

    .feature-card {
      flex: 1;
      height: 331px;
      border-radius: 12px;
      padding: 40px;
      box-sizing: border-box;
      flex-shrink: 0;
      border: 1px solid var(--el-border-color);
      box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      @include mobile {
        width: 100%;
        height: auto;
        min-height: auto;
        padding: 24px;
      }

      .feature-icon {
        width: 56px;
        height: 56px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        @include mobile {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }
      }

      .feature-title {
        font-size: 28px;
        font-weight: 600;
        line-height: 1.4;
        margin: 0 0 18px 0;
        color: var(--el-text-color-primary);

        @include mobile {
          font-size: 24px;
          margin-bottom: 16px;
        }
      }

      .feature-description {
        font-size: 18px;
        color: var(--el-text-color-secondary);
        line-height: 1.7;
        margin-top: 0;

        @include mobile {
          font-size: 14px;
          line-height: 1.6;
        }

        :deep(.font-bold) {
          font-weight: 600;
        }
      }
    }
  }
}
</style>
