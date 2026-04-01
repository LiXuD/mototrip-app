import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import IconSvg from './components/IconSvg.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  app.component('IconSvg', IconSvg)
  return {
    app,
  }
}
