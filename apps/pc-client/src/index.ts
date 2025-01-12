import { createApp, nextTick } from 'vue';

import App from './App.vue';
import './style.css';

createApp(App).mount('#app');

nextTick(async () => {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
  });
  // const v = await window.ipcRenderer.invoke('test', 'hello');
  // console.log(v);
});
