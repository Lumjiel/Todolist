<template>
  <view class="custom-tab-bar">
    <!-- 顶部阴影装饰线 -->
    <view class="tab-bar-shadow"></view>
    
    <view class="tab-bar-container">
      <view
        v-for="(item, index) in list"
        :key="index"
        class="tab-bar-item"
        :class="{ 'tab-bar-item-active': selected === index }"
        @click="switchTab(index, item)"
      >
        <!-- 图标容器 -->
        <view class="icon-wrapper" :class="{ 'icon-wrapper-active': selected === index }">
          <image
            class="tab-icon"
            :src="selected === index ? item.selectedIconPath : item.iconPath"
            mode="aspectFit"
          />
        </view>
        
        <!-- 文字 -->
        <text 
          class="tab-text" 
          :class="{ 'tab-text-active': selected === index }"
        >
          {{ item.text }}
        </text>
      </view>
    </view>
    
    <!-- 底部安全区域适配 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 2 // 默认选中时间线（中间）
  }
})

const selected = ref(props.current)

const color = '#999999'
const selectedColor = '#4A90E2'

// Tab 配置
const list = [
  {
    pagePath: '/pages/todo/todo',
    iconPath: '/static/tabs/todo.png',
    selectedIconPath: '/static/tabs/todo-active.png',
    text: '待办'
  },
  {
    pagePath: '/pages/habits/habits',
    iconPath: '/static/tabs/habits.png',
    selectedIconPath: '/static/tabs/habits-active.png',
    text: '习惯'
  },
  {
    pagePath: '/pages/index/index',
    iconPath: '/static/tabs/timeline.png',
    selectedIconPath: '/static/tabs/timeline-active.png',
    text: '时间线'
  },
  {
    pagePath: '/pages/wish/wish',
    iconPath: '/static/tabs/wish.png',
    selectedIconPath: '/static/tabs/wish-active.png',
    'text': '星愿'
  },
  {
    pagePath: '/pages/settings/settings',
    iconPath: '/static/tabs/settings.png',
    selectedIconPath: '/static/tabs/settings-active.png',
    text: '设置'
  }
]

const switchTab = (index, item) => {
  if (selected.value === index) return
  
  selected.value = index
  
  uni.switchTab({
    url: item.pagePath
  })
}

// 页面加载时根据当前页面设置选中状态
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = currentPage.route
  
  const index = list.findIndex(item => item.pagePath === `/${route}`)
  if (index !== -1) {
    selected.value = index
  }
})
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  z-index: 999;
}

.tab-bar-shadow {
  height: 1px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.03), transparent);
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
}

.tab-bar-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100rpx;
  padding: 10rpx 0 0;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.92);
  }
}

.tab-bar-item-active {
  transform: scale(1.05);
}

.icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: scale(1);
}

.icon-wrapper-active {
  transform: scale(1.15);
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
}

.tab-text {
  font-size: 22rpx;
  line-height: 1;
  transition: all 0.2s ease;
  font-weight: 400;
}

.tab-text-active {
  font-weight: 600;
  transform: scale(1.05);
}

.safe-area-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  background: #FFFFFF;
}
</style>