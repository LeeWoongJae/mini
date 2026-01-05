import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import router from './router/routes.js'
import App from './App.vue'

// createApp(App).mount('#app')
const app = createApp(App).use(router)
app.use(createPinia())
app.mount('#app')