import PrimeVue from 'primevue/config';
import Divider from 'primevue/divider';
import InputNumber from 'primevue/inputnumber';
import { createApp } from 'vue'
import App from './App.vue'

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App)

app.use(PrimeVue);

// eslint-disable-next-line vue/multi-word-component-names
app.component('Divider', Divider);
app.component('InputNumber', InputNumber);

app.mount('#app')
