import { createApp, nextTick } from 'vue';

import App from './App.vue';
import './style.css';

createApp(App).mount('#app');

nextTick(() => {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
  });
});
