import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import NotificationPlugin from './plugins/notification';


const app = createApp(App)
app.use(router)
app.use(NotificationPlugin)
app.mount('#app')