import type { InjectionKey, Ref } from 'vue';
import VConsole from 'vconsole';
import { inject, markRaw, provide, ref } from 'vue';

export interface UseVConsoleProps {
  defaultOpen?: boolean;
}

const VConsoleKey: InjectionKey<{ vConsole: VConsole; open: Ref<boolean> }> =
  (window as any).__TK_VCONSOLE_KEY__ ||
  ((window as any).__TK_VCONSOLE_KEY__ = Symbol('VConsole'));

let vConsole: VConsole;

export function provideVConsole(props: UseVConsoleProps) {
  if (!vConsole) {
    vConsole = markRaw(new VConsole());
  }
  const { defaultOpen = false } = props;
  const open = ref(defaultOpen);
  if (!defaultOpen) {
    vConsole.hideSwitch();
  }
  provide(VConsoleKey, { vConsole, open });
  return { vConsole, open };
}

export function useVConsole(): {
  vConsole: VConsole;
  vConsoleOpen: Ref<boolean>;
  toggleVConsoleOpen: () => void;
} {
  const result = inject(VConsoleKey);
  if (!result) {
    throw new Error(
      'VConsole is not provided. Please make sure you register it.',
    );
  }
  return {
    vConsole: result.vConsole,
    vConsoleOpen: result.open,
    toggleVConsoleOpen: () => {
      result.open.value = !result.open.value;
      if (result.open.value) {
        result.vConsole.showSwitch();
      } else {
        result.vConsole.hideSwitch();
        result.vConsole.hide();
      }
    },
  };
}
