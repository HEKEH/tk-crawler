import type { CheckNetworkResultType } from '@tk-mobile-follow-client/shared';
import { CUSTOM_EVENTS } from '../../constants';

export function checkNetwork(): Promise<CheckNetworkResultType> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.CHECK_NETWORK);
}
