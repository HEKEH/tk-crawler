import { onBeforeUnmount, ref } from 'vue';

/**
 * A composable that tracks whether the window is currently visible/active
 * Uses both visibility change and page lifecycle events
 * @returns A ref containing the window's active state
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

  const handleFreeze = () => {
    isActive.value = false;
  };

  const handleResume = () => {
    isActive.value = true;
  };

  // Initialize state
  if (typeof window !== 'undefined') {
    try {
      // Set initial state
      isActive.value = document.visibilityState === 'visible';

      // Listen for visibility changes
      window.addEventListener('visibilitychange', handleVisibilityChange);

      // Listen for page lifecycle events
      document.addEventListener('freeze', handleFreeze);
      document.addEventListener('resume', handleResume);
    } catch (error) {
      console.error('Error setting up window state listeners:', error);
    }
  }

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      try {
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('freeze', handleFreeze);
        document.removeEventListener('resume', handleResume);
      } catch (error) {
        console.error('Error cleaning up window state listeners:', error);
      }
    }
  });

  return isActive;
}
