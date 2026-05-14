<template>
  <view class="market-card" :class="{ 'has-wallpaper': !!wallpaper }" :style="cardStyle" @click.stop="onClick">
    <view class="card-overlay" v-if="wallpaper"></view>
    
    <!-- Delete Icon -->
    <view 
      class="delete-icon" 
      v-if="showDelete" 
      @click.stop="onDelete"
    >
      <text class="delete-text">×</text>
    </view>

    <view class="card-content">
      <view class="item-icon">{{ icon }}</view>
      <text class="item-cost">{{ cost }}</text>
      <text class="cost-unit">金币</text>
      <text class="item-name">{{ name }}</text>
      <button class="exchange-btn" @click.stop="exchange">兑换</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  cost: Number,
  icon: String,
  wallpaper: String,
  showDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['exchange', 'click', 'delete'])

const cardStyle = computed(() => {
  if (props.wallpaper) {
    return {
      backgroundImage: `url(${props.wallpaper})`,
      backgroundSize: 'cover'
    }
  }
  return { background: 'var(--card-bg)' }
})

const exchange = () => {
  emit('exchange')
}

const onClick = () => {
  emit('click')
}

const onDelete = () => {
  emit('delete')
}
</script>

<style scoped>
.market-card {
  border-radius: 20rpx;
  padding: 20rpx;
  position: relative;
  overflow: hidden;
  aspect-ratio: 0.8; /* Taller aspect ratio to fit content in narrower width */
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s;
  
  /* Default Theme Variables (Light/Dark mode adaptive) */
  --card-text-primary: var(--text-primary);
  --card-text-secondary: var(--text-secondary);
  --card-btn-bg: var(--icon-bg-default);
  --card-btn-text: var(--text-primary);
}

.market-card.has-wallpaper {
  /* Forced Dark Mode for Wallpaper cards */
  --card-text-primary: #fff;
  --card-text-secondary: rgba(255, 255, 255, 0.6);
  --card-btn-bg: rgba(255, 255, 255, 0.2);
  --card-btn-text: #fff;
}

.delete-icon {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.delete-text {
  color: #fff;
  font-size: 32rpx;
  line-height: 32rpx;
  margin-top: -4rpx;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4rpx);
}

.card-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between; /* Better spacing distribution */
  padding: 10rpx 0;
}

.item-icon {
  font-size: 52rpx; /* Smaller icon */
  margin-bottom: 8rpx;
}

.item-cost {
  font-size: 40rpx; /* Smaller cost */
  font-weight: 700;
  color: var(--card-text-primary);
  line-height: 1;
}

.cost-unit {
  font-size: 20rpx;
  color: var(--card-text-secondary);
  margin-bottom: 8rpx;
}

.item-name {
  font-size: 24rpx; /* Smaller name */
  color: var(--card-text-primary);
  margin-bottom: 12rpx;
  text-align: center;
  white-space: nowrap; /* Prevent wrapping if possible, or allow limit */
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.exchange-btn {
  width: 100%;
  height: 56rpx; /* Smaller button height */
  line-height: 56rpx;
  background: var(--card-btn-bg);
  color: var(--card-btn-text);
  border-radius: 28rpx;
  font-size: 24rpx; /* Smaller button text */
  border: none;
  padding: 0; /* Remove default padding */
}
</style>