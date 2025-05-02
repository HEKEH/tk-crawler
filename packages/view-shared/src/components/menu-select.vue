<script setup lang="ts">
import { ElMenu, ElMenuItem, ElOption, ElSelect } from 'element-plus';
import { useIsWebSize } from '../hooks';

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
const isWeb = useIsWebSize();
</script>

<template>
  <ElMenu
    v-if="isWeb"
    :default-active="value"
    class="w-full border-r-0"
    @select="handleSelectMenu"
  >
    <ElMenuItem v-for="menu in menus" :key="menu.value" :index="menu.value">
      <span>{{ menu.label }}</span>
    </ElMenuItem>
  </ElMenu>
  <ElSelect
    v-else
    class="w-full"
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
