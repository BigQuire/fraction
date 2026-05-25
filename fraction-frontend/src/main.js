import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'
import { applyTheme, getStoredSettings } from './utils/preferences'

const app = createApp(App)

app.use(createPinia())
app.use(router)

applyTheme(getStoredSettings().theme)

app.mount('#app')
