import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import { auth } from './store/auth';

if (auth.token.value) {
  axios.defaults.headers.common.Authorization = `Bearer ${auth.token.value}`;
}

const app = createApp(App);

app.use(router);
app.mount('#app');
