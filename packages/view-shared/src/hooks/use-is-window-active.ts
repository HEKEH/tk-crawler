import { onBeforeUnmount, ref } from 'vue';

/**
 * A composable that tracks whether the window is currently visible/active
 * @returns A shallow ref containing the window's active state
 */
export function useIsWindowActive() {
  const isActive = ref(true);

  const handleVisibilityChange = () => {
    try {
      isActive.value = document.visibilityState === 'visible';
    } catch (error) {
      console.error('Error updating window visibility state:', error);
      isActive.value = true; // Fallback to true on error
    }
  };

  // Initialize state
  if (typeof window !== 'undefined') {
    try {
      isActive.value = document.visibilityState === 'visible';
      window.addEventListener('visibilitychange', handleVisibilityChange);
    } catch (error) {
      console.error('Error setting up window visibility listener:', error);
    }
  }

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      try {
        window.removeEventListener('visibilitychange', handleVisibilityChange);
      } catch (error) {
        console.error('Error cleaning up window visibility listener:', error);
      }
    }
  });

  return isActive;
}
