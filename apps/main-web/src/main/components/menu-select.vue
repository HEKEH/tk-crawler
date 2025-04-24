<script setup lang="ts">
import { useIsWeb } from '@tk-crawler/view-shared';
import { ElMenu, ElMenuItem, ElOption, ElSelect } from 'element-plus';

interface MenuSelectProps<T = any> {
  menus: {
    value: T;
    label: string;
  }[];
  value: T;
}

defineOptions({
  name: 'MenuSelect',
});

defineProps<MenuSelectProps>();
const emit = defineEmits<{
  (e: 'select', value: any): void;
}>();

function handleSelectMenu(value: any) {
  emit('select', value);
}
const isWeb = useIsWeb();
</script>

<template>
  <ElMenu
    v-if="isWeb"
    :default-active="value"
    class="side-menus"
    @select="handleSelectMenu"
  >
    <ElMenuItem v-for="menu in menus" :key="menu.value" :index="menu.value">
      <span>{{ menu.label }}</span>
    </ElMenuItem>
  </ElMenu>
  <ElSelect
    v-else
    class="select-menus"
    :model-value="value"
    @change="handleSelectMenu"
  >
    <ElOption
      v-for="menu in menus"
      :key="menu.value"
      :label="menu.label"
      :value="menu.value"
    />
  </ElSelect>
</template>

<style scoped>
.side-menus {
  width: 100%;
  border-right: unset;
}
.select-menus {
  width: 100%;
}
</style>
