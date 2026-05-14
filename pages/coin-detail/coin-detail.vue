<template>
  <view class="page-container">
    <view class="header-section">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <text class="back-arrow">←</text>
        </view>
        <text class="page-title">金币明细</text>
        <view class="right-placeholder"></view>
      </view>
      
      <view class="balance-card">
        <text class="balance-label">当前金币</text>
        <view class="balance-row">
          <text class="coin-icon">🪙</text>
          <text class="balance-num">{{ userStore.coins }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="history-list">
      <view v-if="history.length === 0" class="empty-state">
        <text class="empty-text">暂无记录</text>
      </view>
      
      <view 
        v-for="item in history" 
        :key="item.id"
        class="history-item"
      >
        <view class="item-left">
          <text class="item-reason">{{ item.reason }}</text>
          <text class="item-time">{{ formatTime(item.time) }}</text>
        </view>
        <view class="item-right" :class="item.type">
          <text class="amount-text">{{ item.type === 'earn' ? '+' : '-' }}{{ item.amount }}</text>
        </view>
      </view>
      
      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const history = computed(() => userStore.coinHistory || [])

const goBack = () => {
  uni.navigateBack()
}

const formatTime = (timeStr) => {
  // Simple formatter, assumes timeStr is reasonably formatted or timestamp
  if (!timeStr) return ''
  // If it's a full locale string, maybe just extract date/time?
  // Let's just return it as is or simplify if needed.
  // The store saves `new Date().toLocaleString()`
  return timeStr
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #F5F7FA;
  display: flex;
  flex-direction: column;
}

.header-section {
  background: #FFFFFF;
  padding-bottom: 40rpx;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-top: var(--status-bar-height);
}

.back-btn {
  padding: 20rpx;
  margin-left: -20rpx;
}

.back-arrow {
  font-size: 40rpx;
  color: #333;
}

.page-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.right-placeholder {
  width: 40rpx;
}

.balance-card {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.balance-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.balance-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.coin-icon {
  font-size: 48rpx;
}

.balance-num {
  font-size: 60rpx;
  font-weight: 700;
  color: #333;
}

.history-list {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
}

.history-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-reason {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}

.item-right {
  font-size: 36rpx;
  font-weight: 600;
}

.item-right.earn {
  color: #FFB800;
}

.item-right.spend {
  color: #333;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding-top: 100rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}
</style>