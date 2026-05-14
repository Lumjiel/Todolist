<template>
  <view class="container" :class="{ 'dark-mode': userStore.settings.darkMode }" @click="activeCardId = null">
    <!-- 头部金币展示 -->
    <view class="coins-header">
      <view class="coins-card">
        <view class="coins-label">
          <text class="coin-icon-small">🪙</text>
          <text>我的金币</text>
        </view>
        <view class="coins-amount">
          <text class="coins-number">{{ userStore.coins }}</text>
          <text class="coins-unit">枚</text>
        </view>
        <view class="detail-btn" @click="showDetail">
          <text>明细 ></text>
        </view>
      </view>
    </view>
    
    <!-- 切换标签 -->
    <view class="wish-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'poor' }"
        @click="currentTab = 'poor'"
      >
        <text class="tab-icon">🏚️</text>
        <text class="tab-text">贫民窟</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'wish' }"
        @click="currentTab = 'wish'"
      >
        <text class="tab-icon">✨</text>
        <text class="tab-text">星愿池</text>
      </view>
    </view>
    
    <!-- 贫民窟内容 -->
    <view v-if="currentTab === 'poor'" class="market-section">
      <view class="section-title">普通市场</view>
      <view class="market-grid">
        <market-card
          v-for="item in marketStore.poorItems"
          :key="item.id"
          v-bind="item"
          :show-delete="activeCardId === item.id"
          @exchange="exchange(item)"
          @click="onCardClick(item)"
          @delete="deleteItem(item)"
        />
        <view class="add-card" @click.stop="openAddModal('poor')">
          <text class="add-icon">+</text>
          <text class="add-text">添加奖励</text>
        </view>
      </view>
    </view>
    
    <!-- 星愿池内容 -->
    <view v-else class="market-section">
      <view class="section-title star-title">星愿市场</view>
      <view class="market-grid">
        <market-card
          v-for="item in marketStore.wishItems"
          :key="item.id"
          v-bind="item"
          :show-delete="activeCardId === item.id"
          @exchange="exchange(item)"
          @click="onCardClick(item)"
          @delete="deleteItem(item)"
        />
        <view class="add-card" @click.stop="openAddModal('wish')">
          <text class="add-icon">+</text>
          <text class="add-text">添加星愿</text>
        </view>
      </view>
    </view>
    
    <!-- 添加弹窗 - 使用 :show 而不是 v-model -->
    <add-market-modal
      :show="showAddModal"
      @update:show="showAddModal = $event"
      :type="addType"
      :edit-data="editingItem"
      @confirm="addMarketItem"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useMarketStore } from '@/store/modules/market'
import MarketCard from '@/components/market-card/market-card.vue'
import AddMarketModal from '@/components/add-market-modal/add-market-modal.vue'

const userStore = useUserStore()
const marketStore = useMarketStore()
const currentTab = ref('poor')
// const isDark = ref(false) // Removed as we are now always dark
const showAddModal = ref(false)  // 控制弹窗显示
const addType = ref('poor')
const editingItem = ref(null)
const activeCardId = ref(null)

const switchPool = () => {
  currentTab.value = currentTab.value === 'poor' ? 'wish' : 'poor'
  activeCardId.value = null
}

const openAddModal = (type) => {
  activeCardId.value = null
  addType.value = type
  editingItem.value = null
  showAddModal.value = false
  setTimeout(() => {
    showAddModal.value = true
  }, 50)
}

const onCardClick = (item) => {
  if (activeCardId.value === item.id) {
    activeCardId.value = null
  } else {
    activeCardId.value = item.id
  }
}

const deleteItem = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个奖励吗？',
    success: (res) => {
      if (res.confirm) {
        marketStore.removeItem(item.id, currentTab.value)
        activeCardId.value = null
        uni.showToast({ title: '删除成功', icon: 'none' })
      }
    }
  })
}

const addMarketItem = (item) => {
  if (item.id && (marketStore.poorItems.find(i => i.id === item.id) || marketStore.wishItems.find(i => i.id === item.id))) {
    // Update existing
    marketStore.updateItem(item, addType.value)
    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    // Create new
    if (addType.value === 'poor') {
      marketStore.addPoorItem(item)
    } else {
      marketStore.addWishItem(item)
    }
    uni.showToast({ title: '添加成功', icon: 'success' })
  }
}

const exchange = (item) => {
  if (userStore.deductCoins(item.cost)) {
    uni.showToast({ 
      title: `兑换成功: ${item.name}`, 
      icon: 'success' 
    })
  } else {
    uni.showToast({ 
      title: '金币不足', 
      icon: 'none' 
    })
  }
}

const showDetail = () => {
  uni.navigateTo({ url: '/pages/coin-detail/coin-detail' })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  /* Force Dark Theme for Star Wish Page */
  --bg-color: #0B1026;
  --card-bg: #1B2440;
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --icon-bg-default: rgba(255, 255, 255, 0.1);
  
  background: var(--bg-color);
  padding-bottom: 120rpx;
  padding-top: var(--status-bar-height);
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.coins-header {
  padding: 32rpx;
}

.coins-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  padding: 40rpx;
  position: relative;
  overflow: hidden;
}

.coins-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.coins-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: rgba(255,255,255,0.8);
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.coin-icon-small {
  font-size: 32rpx;
}

.coins-amount {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.coins-number {
  font-size: 72rpx;
  font-weight: 700;
  color: #ffd700;
  line-height: 1;
}

.coins-unit {
  font-size: 32rpx;
  color: rgba(255,255,255,0.8);
}

.detail-btn {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  background: #ffd700;
  color: #333;
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.wish-tabs {
  display: flex;
  padding: 0 32rpx;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  background: var(--card-bg);
  color: var(--text-primary);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.tab-item.active {
  background: #007AFF;
  color: #fff;
}

.tab-icon {
  font-size: 32rpx;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 600;
}

.market-section {
  padding: 0 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.star-title {
  color: #ffd700;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.add-card {
  aspect-ratio: 1;
  background: var(--card-bg);
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: 2rpx dashed var(--border-color);
  transition: background-color 0.3s, border-color 0.3s;
}

.add-icon {
  width: 64rpx;
  height: 64rpx;
  background: var(--icon-bg-default);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--text-secondary);
}

.add-text {
  font-size: 26rpx;
  color: var(--text-secondary);
}
</style>