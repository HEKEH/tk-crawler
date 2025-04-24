import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

export function useIsWeb() {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  return breakpoints.greater('md');
}

export function useIsMobile() {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  return breakpoints.smaller('md');
}
