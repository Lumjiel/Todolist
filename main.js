import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './store'

// #ifdef VUE3
// 关键：全局注册 uni-popup 组件（解决 H5 端 ref 获取不到的问题）
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import uniPopupMessage from '@dcloudio/uni-ui/lib/uni-popup-message/uni-popup-message.vue'
import uniPopupDialog from '@dcloudio/uni-ui/lib/uni-popup-dialog/uni-popup-dialog.vue'
// #endif

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  
  // #ifdef VUE3
  // 注册弹窗组件
  app.component('uni-popup', uniPopup)
  app.component('uni-popup-message', uniPopupMessage)
  app.component('uni-popup-dialog', uniPopupDialog)
  // #endif
  
  return {
    app
  }
}