<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

onLaunch(() => {
  const userStore = useUserStore()
  userStore.loadFromStorage()

  // 确保启动页关闭，防止白屏
  // #ifdef APP-PLUS
  plus.navigator.closeSplashscreen()
  // #endif
})
</script>

<style>
/* 全局样式重置 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  
  /* Light Mode Variables */
  --bg-color: #F2F2F7;
  --nav-bg: #F5F6FA;
  --card-bg: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #8E8E93;
  --border-color: #E5E5EA;
  --icon-bg-default: #F2F2F7;
  --accent-color: #007AFF;
}

/* Dark Mode Classes - Applied to the root element of pages */
.dark-mode {
  --bg-color: #121212;
  --nav-bg: #121212;
  --card-bg: #1E1E1E;
  --text-primary: #FFFFFF;
  --text-secondary: #EBEBF5; /* 60% opacity equivalent */
  --border-color: #38383A;
  --icon-bg-default: #2C2C2E;
  --accent-color: #0A84FF;
}

/* Common Utilities */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.bg-primary { background-color: var(--bg-color); }
.bg-card { background-color: var(--card-bg); }
</style>
