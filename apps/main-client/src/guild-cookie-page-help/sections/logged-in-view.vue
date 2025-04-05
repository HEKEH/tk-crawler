<script setup lang="ts">
defineOptions({
  name: 'LoggedInView',
});
</script>

<template>
  <div class="block">
    <!-- <div class="description">
      右侧页面表格中的主播信息会被自动采集。
      <br />
      为了加快采集速度，建议每页条数改为200。
    </div>
    <div class="tip">正在自动采集中...<br />请在右侧页面获取您想要的数据 →</div> -->
  </div>
</template>

<style scoped>
.description {
  font-size: 15px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
.tip {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: var(--el-color-primary);
}
/* .loading {
  width: 100%;
  height: 20px;
  :global(.path) {
    r: 14px !important;
  }
} */
</style>
