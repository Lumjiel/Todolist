<template>
  <view 
    class="habit-card"
    :class="{ 
      'completed': isCompleted,
      'bad-habit': habit.isBad,
      'disabled': !canComplete
    }"
    @click="onClick"
  >
    <!-- 顶部标签 -->
    <view class="card-header">
      <coin-badge :value="habit.isBad ? -habit.coins : habit.coins" size="small" />
      <text v-if="habit.isStar" class="star-icon">⭐</text>
    </view>
    
    <!-- 内容 -->
    <view class="card-content">
      <text class="habit-name">{{ habit.name }}</text>
      <text v-if="habit.icon" class="habit-icon">{{ habit.icon }}</text>
    </view>
    
    <!-- 底部状态 -->
    <view class="card-footer">
      <template v-if="habit.isBad">
        <view class="stat-item">
          <view class="stat-icon shield">🛡️</view>
          <text class="stat-text">剩{{ habit.tolerance - habit.currentTolerance }}</text>
        </view>
        <view class="stat-item">
          <view class="stat-icon fire">🔥</view>
          <text class="stat-text">{{ habit.streak }}天</text>
        </view>
      </template>
      <template v-else>
        <view class="stat-item">
          <view class="stat-icon" :class="{ 'checked': todayCompleted }">
            {{ todayCompleted ? '✓' : '○' }}
          </view>
          <text class="stat-text">{{ habit.totalCompleted }}次</text>
        </view>
        <view class="stat-item">
          <view class="stat-icon target">🎯</view>
          <text class="stat-text">{{ habit.streak }}次</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import CoinBadge from '../coin-badge/coin-badge.vue'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  todayCompleted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'complete'])

const canComplete = computed(() => {
  if (props.habit.isBad) return true
  return !props.todayCompleted
})

const onClick = () => {
  emit('click', props.habit)
}
</script>

<script>
import { computed } from 'vue'
</script>

<style scoped>
.habit-card {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  position: relative;
  transition: all 0.3s;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.habit-card:active {
  transform: scale(0.98);
}

.habit-card.completed {
  opacity: 0.7;
  background: #F9F9F9;
}

.habit-card.bad-habit {
  background: #1C1C1E;
  border: 2rpx dashed #FF3B30;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.star-icon {
  font-size: 24rpx;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.habit-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 16rpx;
  text-align: center;
}

.bad-habit .habit-name {
  color: white;
}

.habit-icon {
  font-size: 64rpx;
}

.card-footer {
  display: flex;
  justify-content: center;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #F2F2F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #8E8E93;
}

.stat-icon.checked {
  background: #34C759;
  color: white;
}

.stat-icon.shield {
  background: #333;
  color: #8E8E93;
}

.stat-icon.fire {
  background: #FF9500;
  color: white;
}

.stat-icon.target {
  background: #FFD700;
  color: #333;
}

.stat-text {
  font-size: 22rpx;
  color: #8E8E93;
}

.bad-habit .stat-text {
  color: #666;
}
</style>