<template>
  <view class="coin-badge" :class="size">
    <text class="coin-icon">🪙</text>
    <text class="coin-value" :class="{ 'negative': value < 0 }">
      {{ value > 0 ? '+' : '' }}{{ value }}
    </text>
  </view>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: 'normal' // small, normal, large
  }
})
</script>

<style scoped>
.coin-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  background: #FFF8E1;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
}

.coin-badge.small {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.coin-badge.large {
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
}

.coin-icon {
  font-size: 20rpx;
}

.coin-badge.large .coin-icon {
  font-size: 28rpx;
}

.coin-value {
  font-size: 22rpx;
  color: #FFB300;
  font-weight: 600;
}

.coin-badge.large .coin-value {
  font-size: 32rpx;
}

.coin-value.negative {
  color: #FF3B30;
}
</style>