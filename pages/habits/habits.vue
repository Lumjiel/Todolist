<template>
  <view class="page-container">
    <view class="status-bar"></view>
    
    <!-- 1. 顶部区域 -->
    <view class="header">
      <!-- 连胜标识 -->
      <view class="streak-badge">
        <text class="flame">🔥</text>
        <text class="streak-count">{{ habitStore.currentStreak }} 连胜</text>
      </view>
      
      <!-- 标题栏 -->
      <view class="title-bar">
        <view class="title-wrap">
          <text class="main-title">今日习惯</text>
        </view>
      </view>
      
      <!-- 右侧按钮 -->
      <view class="header-actions">
        <view class="action-btn" @click="addHabit" v-if="!isDeleteMode">
          <text class="plus">+</text>
        </view>
        <view class="action-btn" @click="toggleMoreMenu">
          <text class="dots">···</text>
        </view>
      </view>
    </view>

    <!-- 下拉菜单遮罩 -->
    <view class="dropdown-mask" v-if="showMoreMenu" @click="closeMenus"></view>

    <!-- 更多操作菜单 -->
    <view class="dropdown-menu more-menu" v-if="showMoreMenu">
      <view class="dropdown-item" @click="enterDeleteMode">
        <text>勾选删除</text>
      </view>
      <view class="dropdown-item" @click="confirmDeleteAll">
        <text>全部删除</text>
      </view>
    </view>

    <!-- 标签栏 -->
    <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
      <view class="tab-list">
        <view 
          class="tab-item star-tab" 
          :class="{ active: activeCategory === 'star' }"
          @click="activeCategory = 'star'"
        >
          <text>⭐</text>
        </view>
        <view 
          v-for="cat in categories" 
          :key="cat.id"
          class="tab-item"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 习惯列表内容 -->
    <scroll-view scroll-y class="content-scroll">
      <view class="sections-container">
        <view 
          v-for="section in displaySections" 
          :key="section.id"
          class="category-section"
        >
          <!-- 分类头部 -->
          <view class="section-header" @click="toggleSection(section.id)">
            <view class="header-left">
              <text class="section-arrow" :class="{ collapsed: section.collapsed }">⌄</text>
              <text class="section-icon">{{ section.icon }}</text>
              <text class="section-name">{{ section.name }}</text>
              <text class="section-count">{{ section.habits.length }}</text>
            </view>
            <view class="header-right">
              <view class="section-indicator"></view>
            </view>
          </view>
          
          <!-- 卡片网格 -->
          <view class="habit-grid" v-if="!section.collapsed">
            <view 
              v-for="habit in section.habits" 
              :key="habit.id"
              class="habit-card"
              :class="{ 
                'special-card': habit.isBad || isCompletedToday(habit),
                'bad-habit': habit.isBad,
                'completed': isCompletedToday(habit),
                'selected': isDeleteMode && selectedHabitIds.includes(habit.id)
              }"
              @click="handleHabitClick(habit)"
            >
              <!-- 左上角金币 -->
              <view class="card-tag coin-tag" :class="{ negative: habit.isBad }">
                <text class="coin-symbol">🪙</text>
                <text>{{ habit.isBad ? '-' : '+' }}{{ habit.coins }}</text>
              </view>
              
              <!-- 右上角星标 / 选中框 -->
              <view class="card-tag star-tag">
                <text v-if="!isDeleteMode" class="star-icon" :class="{ active: habit.isStarred }">⭐</text>
                <view v-else class="select-checkbox" :class="{ checked: selectedHabitIds.includes(habit.id) }">
                   <text v-if="selectedHabitIds.includes(habit.id)">✓</text>
                </view>
              </view>
              
              <!-- 中间图标 -->
              <view class="card-main-icon">
                <text class="emoji-icon">{{ habit.icon }}</text>
              </view>
              
              <!-- 习惯名称 -->
              <text class="card-name">{{ habit.name }}</text>
              
              <!-- 底部状态 -->
              <view class="card-footer">
                <view class="footer-left" @click.stop="!isDeleteMode && toggleCheckIn(habit)">
                  <view class="check-circle" :class="{ checked: isCompletedToday(habit) }">
                    <text v-if="isCompletedToday(habit)">✓</text>
                  </view>
                  <text class="count-text">{{ habit.totalCompleted }}次</text>
                </view>
                <view class="footer-right">
                  <text class="streak-icon">🔥</text>
                  <text class="streak-val">{{ habit.streak }}天</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="displaySections.length === 0" class="empty-state">
          <text>暂无习惯</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 (删除模式) -->
    <view class="delete-bar" v-if="isDeleteMode">
      <view class="delete-btn cancel" @click="cancelDeleteMode">取消</view>
      <view class="delete-btn confirm" :class="{ disabled: selectedHabitIds.length === 0 }" @click="executeBatchDelete">删除 ({{ selectedHabitIds.length }})</view>
    </view>

    <!-- 弹窗 -->
    <add-habit-modal
      :show="showAddModal"
      :edit-data="editingHabit"
      @update:show="onModalChange"
      @confirm="onHabitConfirm"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHabitStore } from '@/store/modules/habits'
import { useUserStore } from '@/store/modules/user'
import AddHabitModal from '@/components/add-habit-modal/add-habit-modal.vue'

const habitStore = useHabitStore()
const userStore = useUserStore()
const showAddModal = ref(false)
const editingHabit = ref(null)
const activeCategory = ref('all')
const collapsedSections = ref({})

// Menu & Delete State
const showMoreMenu = ref(false)
const isDeleteMode = ref(false)
const selectedHabitIds = ref([])

// 基础分类定义
const categories = [
  { id: 'all', name: '全部' },
  { id: 'sport', name: '运动' },
  { id: 'study', name: '学习' },
  { id: 'quit', name: '戒除' },
  { id: 'life', name: '生活' },
  { id: 'work', name: '工作' }
]

// 映射分类图标
const categoryIcons = {
  sport: '🏀',
  study: '📚',
  quit: '🚭',
  life: '🏠',
  work: '💼',
  health: '❤️',
  other: '✨'
}

onMounted(() => {
  habitStore.init()
})

// Menu Logic
const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

const closeMenus = () => {
  showMoreMenu.value = false
}

// Delete Logic
const enterDeleteMode = () => {
  isDeleteMode.value = true
  closeMenus()
  selectedHabitIds.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedHabitIds.value = []
}

const confirmDeleteAll = () => {
  closeMenus()
  uni.showModal({
    title: '确认全部删除',
    content: '确定要清空所有习惯吗？此操作不可恢复。',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) {
        habitStore.deleteAllHabits()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

const executeBatchDelete = () => {
  if (selectedHabitIds.value.length === 0) return
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedHabitIds.value.length} 个习惯吗？`,
    success: (res) => {
      if (res.confirm) {
        habitStore.deleteHabits(selectedHabitIds.value)
        cancelDeleteMode()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const handleHabitClick = (habit) => {
  if (isDeleteMode.value) {
    const index = selectedHabitIds.value.indexOf(habit.id)
    if (index > -1) {
      selectedHabitIds.value.splice(index, 1)
    } else {
      selectedHabitIds.value.push(habit.id)
    }
  } else {
    editHabit(habit)
  }
}

// 计算展示的分组
const displaySections = computed(() => {
  const allHabits = habitStore.habits || []
  let filteredHabits = []
  
  // 1. 筛选习惯
  if (activeCategory.value === 'star') {
    filteredHabits = allHabits.filter(h => h.isStarred)
  } else if (activeCategory.value === 'all') {
    filteredHabits = allHabits
  } else {
    // 特殊处理：戒除习惯通常归类为 'quit'，但也可能有 bad=true 且 category='life' 的情况
    // 这里简单按 category 筛选
    filteredHabits = allHabits.filter(h => h.category === activeCategory.value)
  }

  // 2. 分组逻辑
  // 我们需要把习惯按分类（或状态）分组显示
  // 如果选的是 "全部" 或 "星标"，我们按分类分组
  // 如果选的是具体分类，我们可能还需要分子组（如 "未完成", "已完成", "坏习惯"）
  // 根据需求描述： "分类模块（以“生活”分类为例）" -> 暗示即使在 "全部" 下也是按分类展示模块
  
  const groups = {}
  
  filteredHabits.forEach(habit => {
    // 确定分组 Key
    let groupKey = habit.category
    let groupName = categories.find(c => c.id === groupKey)?.name || '其他'
    let groupIcon = categoryIcons[groupKey] || '✨'
    
    // 特殊分组：坏习惯单独一组？或者就在各自分类下？
    // 需求提到 "坏习惯" 分组 (section-header bad)
    // 让我们把坏习惯单独提出来作为一个 "戒除/坏习惯" 组，或者保留在原分类但样式不同？
    // 原设计中有 "坏习惯" 分组。
    // 如果 habit.isBad，我们将其归入 'quit' 组或者专门的 'bad' 组
    if (habit.isBad) {
      groupKey = 'bad'
      groupName = '坏习惯'
      groupIcon = '🚫'
    } else if (isCompletedToday(habit)) {
        // 需求截图中有 "已完成" 分组
        // 如果想把已完成的单独分组，可以开启此逻辑
        // groupKey = 'completed'
        // groupName = '已完成'
        // groupIcon = '✅'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: groupKey,
        name: groupName,
        icon: groupIcon,
        habits: [],
        collapsed: !!collapsedSections.value[groupKey]
      }
    }
    groups[groupKey].habits.push(habit)
  })

  // 排序：根据 categories 顺序排序 group
  const result = []
  
  // 优先按 categories 定义的顺序
  categories.forEach(cat => {
    if (groups[cat.id]) {
      result.push(groups[cat.id])
      delete groups[cat.id]
    }
  })
  
  // 加上坏习惯
  if (groups['bad']) {
    result.push(groups['bad'])
    delete groups['bad']
  }
  
  // 加上已完成 (如果启用了单独分组)
  if (groups['completed']) {
    result.push(groups['completed'])
    delete groups['completed']
  }
  
  // 加上剩余的
  Object.values(groups).forEach(g => result.push(g))
  
  return result
})

const isCompletedToday = (habit) => {
  if (!habit || !habit.lastCompletedDate) return false
  const today = new Date().toISOString().split('T')[0]
  return habit.lastCompletedDate === today
}

const getCardBackground = (habit) => {
  if (isCompletedToday(habit)) return '#FF3B30'
  if (habit.color && habit.color !== '#FFFFFF') return habit.color
  if (habit.isBad) return '#2C2C2E'
  return '#FFFFFF'
}

const toggleSection = (sectionId) => {
  collapsedSections.value[sectionId] = !collapsedSections.value[sectionId]
}

const addHabit = () => {
  editingHabit.value = null
  showAddModal.value = false
  setTimeout(() => showAddModal.value = true, 50)
}

const editHabit = (habit) => {
  editingHabit.value = habit
  showAddModal.value = true
}

const toggleCheckIn = (habit) => {
  habitStore.checkIn(habit.id)
}

const onModalChange = (val) => {
  showAddModal.value = val
}

const onHabitConfirm = (data) => {
  if (editingHabit.value) {
    habitStore.updateHabit(data)
  } else {
    habitStore.createHabit(data)
  }
  showAddModal.value = false
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: var(--bg-color);
  padding-top: var(--status-bar-height);
  padding-bottom: 120rpx; /* Bottom Nav Space */
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
}

/* 1. 顶部区域 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  position: relative;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  /* 宽度缩短 10% (相对于原视觉，这里用紧凑布局实现) */
}

.flame {
  font-size: 36rpx;
}

.streak-count {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
}

.title-bar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.main-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: var(--text-primary);
}

.plus { font-weight: 300; font-size: 48rpx; }
.dots { font-weight: 900; font-size: 32rpx; margin-top: -10rpx; }

/* 标签栏 */
.tab-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 10rpx 0 30rpx 0;
}

.tab-list {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  gap: 24rpx; /* 间距缩小 */
}

.tab-item {
  display: inline-block;
  font-size: 28rpx;
  color: var(--text-secondary);
  padding: 10rpx 0;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 30rpx;
}

.star-tab {
  margin-right: 12rpx;
}

/* 2. 分类模块 */
.content-scroll {
  height: calc(100vh - 300rpx);
}

.sections-container {
  padding: 0 30rpx;
}

.category-section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  /* 高度为原“我的习惯”1.2倍 -> 增加padding */
  padding: 10rpx 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.section-arrow {
  font-size: 24rpx;
  color: var(--text-secondary);
  transition: transform 0.3s;
  
  &.collapsed {
    transform: rotate(-90deg);
  }
}

.section-icon {
  font-size: 40rpx; /* 文字高度 120% */
}

.section-name {
  font-size: 34rpx; /* 同原“我的习惯” */
  font-weight: bold;
  color: var(--text-primary);
}

.section-count {
  font-size: 26rpx; /* 名称的 80% */
  color: var(--text-secondary);
  background: var(--icon-bg-default);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.header-right {
  display: flex;
  align-items: center;
}

.section-indicator {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 2rpx solid #E0E0E0;
}

/* 3. 习惯卡片 */
.habit-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  /* 顶部间距为卡片高度20% -> 由 margin-bottom 控制 section-header */
}

.habit-card {
  width: calc(50% - 12rpx); /* 两列 */
  background: var(--card-bg);
  border-radius: 24rpx;
  padding: 16rpx;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140rpx; /* 缩小高度至约 1/2 (原 220rpx) */
  transition: background-color 0.3s;
  color: var(--text-primary);
}

.habit-card.special-card {
  min-height: 160rpx;
}

.habit-card.bad-habit {
  background: #2C2C2E;
  color: white;
}

.habit-card.completed {
  background: #FF3B30; /* 红色主题 */
  color: white;
}

.card-tag {
  position: absolute;
  top: 12rpx;
}

.coin-tag {
  left: 12rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: #FFF9C4;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  font-size: 18rpx;
  color: #FBC02D;
  font-weight: bold;
}

.coin-tag.negative {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.star-tag {
  right: 12rpx;
}

.star-icon {
  font-size: 24rpx;
  color: #DDD;
}
.star-icon.active {
  color: #FFD700;
}

.card-main-icon {
  align-self: center;
  margin-top: 24rpx;
  margin-bottom: 8rpx;
  width: 100%;
  text-align: center;
}

.emoji-icon {
  font-size: 48rpx; /* 缩小图标 */
}

.card-name {
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12rpx;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rpx;
}

.footer-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  width: 30%;
}

.check-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #E5E5EA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: white;
  transition: all 0.2s;
}

.check-circle.checked {
  background: #34C759;
}

.count-text {
  font-size: 16rpx;
  color: var(--text-secondary);
}
.habit-card.bad-habit .count-text,
.habit-card.completed .count-text {
  color: rgba(255,255,255,0.6);
}

.footer-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  width: 30%;
}

.streak-icon {
  font-size: 24rpx;
  color: #FF9500;
}
.streak-val {
  font-size: 16rpx;
  color: var(--text-secondary);
}
.habit-card.bad-habit .streak-val,
.habit-card.completed .streak-val {
  color: rgba(255,255,255,0.6);
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: var(--text-secondary);
  font-size: 28rpx;
}

/* Dropdown Menu */
.dropdown-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 900;
  background: transparent;
}

.dropdown-menu {
  position: absolute;
  top: calc(var(--status-bar-height) + 88rpx);
  right: 30rpx;
  width: 240rpx;
  background: var(--card-bg);
  border-radius: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(0,0,0,0.1);
  z-index: 999;
  padding: 10rpx 0;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  font-size: 30rpx;
  color: var(--text-primary);
  
  &.active {
    background: var(--icon-bg-default);
  }
  
  &:active {
    background: var(--icon-bg-default);
  }
}

/* Selection & Delete Mode */
.select-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 3rpx solid #DDD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: white;
  transition: all 0.2s;
  background: white;
  
  &.checked {
    background: #007AFF;
    border-color: #007AFF;
  }
}

.habit-card.selected {
  border: 3rpx solid #007AFF;
}

.delete-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120rpx;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
}

.delete-btn {
  font-size: 32rpx;
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
}

.delete-btn.cancel {
  color: var(--text-secondary);
  background: var(--icon-bg-default);
}

.delete-btn.confirm {
  color: #fff;
  background: #FF3B30;
}

.delete-btn.confirm.disabled {
  background: #FFD1D1;
  color: rgba(255,255,255,0.8);
}
</style>
