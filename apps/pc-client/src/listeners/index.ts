import { CUSTOM_EVENTS } from '../constants';

export function addDefaultCrawlerSettingListener() {
  window.ipcRenderer.on(
    CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
    (_event, settings) => {
      console.log(settings, 'settings');
    },
  );
}
