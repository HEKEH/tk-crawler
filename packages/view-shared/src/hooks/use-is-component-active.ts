import { onActivated, onDeactivated, ref } from 'vue';

/**
 * A composable that tracks whether a component is currently active
 * Uses Vue's built-in keep-alive activation hooks
 * @returns A ref containing the component's active state
 */
export function useIsComponentActive() {
  const isActive = ref(true);

  onActivated(() => {
    isActive.value = true;
  });

  onDeactivated(() => {
    isActive.value = false;
  });

  return isActive;
}
