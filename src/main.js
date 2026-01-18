// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入 Element Plus 中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 使用中文
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
