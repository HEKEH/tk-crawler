import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

/** 仅用来判断页面尺寸的大小来处理样式，不能使用这个方法判断是否是桌面端 */
export function useIsWebSize() {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  return breakpoints.greater('md');
}

/** 仅用来判断页面尺寸的大小来处理样式，不能使用这个方法判断是否是移动端 */
export function useIsMobileSize() {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  return breakpoints.smaller('md');
}
