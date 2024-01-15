import { createApp } from 'vue';
import Panel from '@/view/panel.vue';
import { createPinia } from 'pinia';
import { compareStoreRuntimeService } from '@/stores/compare.store';
import 'jsondiffpatch/formatters/styles/html.css';

createApp(Panel)
  .use(createPinia())
  .use(compareStoreRuntimeService)
  .mount('#jsdiff-app');
