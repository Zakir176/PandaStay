import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initTheme } from './lib/theme'

initTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')
