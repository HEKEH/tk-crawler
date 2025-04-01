<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

interface Props {
  password: string;
}

const props = defineProps<Props>();

const passwordVisible = ref(false);

const passwordRef = ref<HTMLDivElement | null>(null);

function selectAllText() {
  if (passwordRef.value) {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(passwordRef.value);

    selection.removeAllRanges();
    selection.addRange(range);
  }
}

async function handleClick(e: MouseEvent) {
  e.stopPropagation();
  passwordVisible.value = true;
  await nextTick();
  selectAllText();
}
function handleClose() {
  passwordVisible.value = false;
}
document.addEventListener('click', handleClose);
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClose);
});
</script>

<template>
  <div ref="passwordRef" class="visible-password" @click="handleClick">
    {{ passwordVisible ? props.password : '********' }}
  </div>
</template>

<style scoped>
.visible-password {
  cursor: pointer;
}
</style>
