import { onBeforeUnmount } from 'vue';

export function useChunkLoadErrorHandle(
  handleError = () => window.location.reload(),
) {
  function onHandleChunkLoadError(e: PromiseRejectionEvent) {
    const reason = e?.reason?.toString();
    if (
      reason &&
      (reason.includes('Failed to fetch dynamically imported module') ||
        reason.includes('Unable to preload CSS for'))
    ) {
      handleError();
    }
  }
  window.addEventListener('unhandledrejection', onHandleChunkLoadError);
  onBeforeUnmount(() => {
    window.removeEventListener('unhandledrejection', onHandleChunkLoadError);
  });
}
