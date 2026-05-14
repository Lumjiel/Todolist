<template>
  <view class="page-container" :class="{ 'dark-mode': userStore.settings.darkMode }">
    <view class="status-bar"></view>
    
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="page-title">设置</text>
      <view class="more-btn" @click="showToast('更多功能敬请期待')">
        <text class="dots">···</text>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <!-- 1. 用户资料卡片 -->
      <view class="card user-card slide-up" @click="goToProfile">
        <view class="avatar-box">
          <image 
            v-if="userStore.userInfo.avatar" 
            :src="userStore.userInfo.avatar" 
            class="avatar-img-src"
            mode="aspectFill"
          />
          <view v-else class="avatar-img-placeholder">
            <text class="avatar-icon">👤</text>
          </view>
        </view>
        <view class="user-info">
          <view class="info-top">
            <text class="username">{{ userStore.userInfo.nickname }}</text>
            <text class="arrow">›</text>
          </view>
          <text class="user-id">ID: {{ userStore.userInfo.id }}</text>
          <view class="info-bottom">
            <view class="level-badge">
              <text>Lv.5</text>
            </view>
            <text class="streak-text">已坚持打卡 {{ userStore.streak || 0 }} 天</text>
          </view>
        </view>
      </view>

      <!-- 2. 偏好设置 -->
      <view class="section-title slide-up delay-1">偏好设置</view>
      <view class="card settings-group slide-up delay-1">
        <!-- 深色模式 -->
        <view class="setting-item">
          <view class="item-left">
            <view class="icon-box purple">
              <text>🌙</text>
            </view>
            <text class="item-name">深色模式</text>
          </view>
          <switch 
            :checked="userStore.settings.darkMode" 
            color="#007AFF" 
            style="transform:scale(0.8)"
            @change="handleToggle('darkMode', '深色模式')"
          />
        </view>

        <!-- 消息通知 -->
        <view class="setting-item">
          <view class="item-left">
            <view class="icon-box pink">
              <text>🔔</text>
            </view>
            <view class="text-col">
              <text class="item-name">消息通知</text>
              <text class="item-desc">待办提醒与习惯打卡</text>
            </view>
          </view>
          <switch 
            :checked="userStore.settings.notification" 
            color="#007AFF" 
            style="transform:scale(0.8)"
            @change="handleToggle('notification', '消息通知')"
          />
        </view>

        <!-- 触感反馈 -->
        <view class="setting-item no-border">
          <view class="item-left">
            <view class="icon-box orange">
              <text>📳</text>
            </view>
            <text class="item-name">触感反馈</text>
          </view>
          <switch 
            :checked="userStore.settings.haptic" 
            color="#007AFF" 
            style="transform:scale(0.8)"
            @change="handleToggle('haptic', '触感反馈')"
          />
        </view>
      </view>

      <!-- 3. 数据与账户 -->
      <view class="section-title slide-up delay-2">数据与账户</view>
      <view class="card settings-group slide-up delay-2">
        <view class="setting-item hover-item" @click="showToast('数据同步成功')">
          <view class="item-left">
            <view class="icon-box blue">
              <text>🔄</text>
            </view>
            <text class="item-name">数据同步</text>
          </view>
          <view class="item-right">
            <text class="status-text green">刚刚</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="setting-item hover-item" @click="showToast('云备份功能开发中')">
          <view class="item-left">
            <view class="icon-box purple-light">
              <text>☁️</text>
            </view>
            <text class="item-name">云备份</text>
          </view>
          <text class="arrow">›</text>
        </view>

        <view class="setting-item hover-item no-border" @click="showToast('已退出登录')">
          <view class="item-left">
            <view class="icon-box red-light">
              <text>🚪</text>
            </view>
            <text class="item-name red-text">退出登录</text>
          </view>
        </view>
      </view>

      <!-- 4. 关于 -->
      <view class="section-title slide-up delay-3">关于</view>
      <view class="card settings-group slide-up delay-3">
        <view class="setting-item hover-item" @click="showToast('当前版本: V1.0.0')">
          <view class="item-left">
            <view class="icon-box gray">
              <text>ℹ️</text>
            </view>
            <text class="item-name">版本信息</text>
          </view>
          <view class="item-right">
            <text class="status-text">V1.0.0</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="setting-item hover-item no-border" @click="showToast('感谢您的反馈')">
          <view class="item-left">
            <view class="icon-box green">
              <text>💬</text>
            </view>
            <text class="item-name">意见反馈</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <view class="footer-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const handleToggle = (key, name) => {
  userStore.toggleSetting(key)
  const status = userStore.settings[key] ? '已开启' : '已关闭'
  
  if (key === 'darkMode') {
    // Dark mode specific feedback or logic if needed beyond CSS
  }
  
  uni.showToast({
    title: `${name}${status}`,
    icon: 'none',
    duration: 2000
  })
}

const showToast = (msg) => {
  if (userStore.settings.haptic) {
    uni.vibrateShort()
  }
  uni.showToast({
    title: msg,
    icon: 'none',
    duration: 1500
  })
}

const goToProfile = () => {
  if (userStore.settings.haptic) {
    uni.vibrateShort()
  }
  uni.navigateTo({
    url: '/pages/settings/profile-edit'
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: var(--window-bottom);
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
  background: transparent;
}

/* 导航栏 */
.nav-bar {
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--nav-bg);
  position: sticky;
  top: var(--status-bar-height);
  z-index: 100;
  transition: background-color 0.3s;
}

.page-title {
  font-size: 44rpx;
  font-weight: 800;
  color: var(--text-primary);
  transition: color 0.3s;
}

.more-btn {
  padding: 10rpx;
}

.dots {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);
  letter-spacing: 2rpx;
  transition: color 0.3s;
}

/* 内容区域 */
.content-scroll {
  padding: 20rpx 30rpx 40rpx;
  box-sizing: border-box;
}

.section-title {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin: 40rpx 0 16rpx 10rpx;
  font-weight: 500;
}

/* 卡片通用样式 */
.card {
  background: var(--card-bg);
  border-radius: 32rpx;
  padding: 0;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
  overflow: hidden;
  transition: background-color 0.3s;
}

/* 用户卡片 */
.user-card {
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  margin-top: 20rpx;
  transition: transform 0.2s, background-color 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
}

.avatar-box {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(118, 75, 162, 0.2);
  overflow: hidden;
}

.avatar-img-src {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 60rpx;
  color: white;
}

.user-info {
  flex: 1;
}

.info-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
  transition: color 0.3s;
}

.arrow {
  color: #C7C7CC;
  font-size: 32rpx;
}

.user-id {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
  display: block;
}

.info-bottom {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.level-badge {
  background: #FFF9C4;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  
  text {
    font-size: 20rpx;
    font-weight: bold;
    color: #FBC02D;
  }
}

.streak-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* 设置项 */
.settings-group {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border-color);
  transition: background-color 0.3s, border-color 0.3s;
  
  &.no-border {
    border-bottom: none;
  }
  
  &.hover-item:active {
    background: var(--icon-bg-default);
  }
}

.item-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.icon-box {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 32rpx;
  }
  
  &.purple { background: #F3E5F5; color: #9C27B0; }
  &.pink { background: #FFEBEE; color: #FF5252; }
  &.orange { background: #FFF3E0; color: #FF9800; }
  &.blue { background: #E3F2FD; color: #2196F3; }
  &.purple-light { background: #EDE7F6; color: #673AB7; }
  &.red-light { background: #FFEBEE; color: #D32F2F; }
  &.gray { background: #F5F5F5; color: #757575; }
  &.green { background: #E8F5E9; color: #4CAF50; }
}

.text-col {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.item-name {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
  transition: color 0.3s;
  
  &.red-text {
    color: #FF3B30;
  }
}

.item-desc {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.item-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.status-text {
  font-size: 26rpx;
  color: var(--text-secondary);
  
  &.green {
    color: #4CD964;
  }
}

/* 动画 */
.slide-up {
  opacity: 0;
  transform: translateY(40rpx);
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer-spacer {
  height: 40rpx;
}

/* 深色模式适配 - 特殊微调 */
.dark-mode {
  .icon-box {
    opacity: 0.9;
  }
}
</style>