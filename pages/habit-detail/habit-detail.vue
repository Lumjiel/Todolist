<template>
  <view class="page-container" :class="{ 'dark-mode': userStore.settings.darkMode }">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="goBack">←</text>
      <text class="title">{{ isEdit ? '编辑习惯' : '新建习惯' }}</text>
      <text class="save" @click="saveHabit">保存</text>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form-item">
        <text class="label">习惯名称</text>
        <input 
          v-model="habit.name"
          placeholder="例如：早起、阅读..."
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label">选择图标</text>
        <scroll-view scroll-x class="icon-scroll">
          <view class="icon-list">
            <view 
              v-for="icon in icons" 
              :key="icon"
              class="icon-item"
              :class="{ 'active': habit.icon === icon }"
              @click="habit.icon = icon"
            >
              <text class="icon-text">{{ icon }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="form-item">
        <text class="label">习惯类型</text>
        <view class="type-selector">
          <view 
            class="type-option"
            :class="{ 'active': !habit.isBad }"
            @click="habit.isBad = false"
          >
            <text class="type-icon">✓</text>
            <text>好习惯（+金币）</text>
          </view>
          <view 
            class="type-option bad"
            :class="{ 'active': habit.isBad }"
            @click="habit.isBad = true"
          >
            <text class="type-icon">✕</text>
            <text>坏习惯（-金币）</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">执行频率</text>
        <view class="freq-selector">
          <view 
            class="freq-option"
            :class="{ 'active': habit.frequency === 'daily' }"
            @click="habit.frequency = 'daily'"
          >
            每天
          </view>
          <view 
            class="freq-option"
            :class="{ 'active': habit.frequency === 'weekly' }"
            @click="habit.frequency = 'weekly'"
          >
            每周
          </view>
        </view>
      </view>

      <view v-if="habit.frequency === 'weekly'" class="form-item">
        <text class="label">选择日期</text>
        <view class="week-days">
          <view 
            v-for="(day, index) in weekDays" 
            :key="index"
            class="day-tag"
            :class="{ 'active': habit.weekDays.includes(index) }"
            @click="toggleWeekDay(index)"
          >
            {{ day }}
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">提醒时间</text>
        <picker mode="time" :value="habit.reminderTime" @change="onTimeChange">
          <view class="picker">
            <text>{{ habit.reminderTime || '未设置' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">{{ habit.isBad ? '扣除' : '奖励' }}金币</text>
        <view class="coin-slider">
          <slider 
            :value="habit.coins" 
            min="1" 
            max="20" 
            @change="onCoinChange"
            :active-color="habit.isBad ? '#FF3B30' : '#FFD700'"
            :background-color="userStore.settings.darkMode ? '#3A3A3C' : '#E5E5EA'"
            :block-color="habit.isBad ? '#FF3B30' : '#FFD700'"
          />
          <text class="coin-value" :class="{ 'bad': habit.isBad }">
            {{ habit.isBad ? '-' : '+' }}{{ habit.coins }}
          </text>
        </view>
      </view>

      <view v-if="habit.isBad" class="form-item">
        <text class="label">每月容忍次数</text>
        <view class="tolerance-slider">
          <slider 
            :value="habit.tolerance" 
            min="0" 
            max="10" 
            @change="onToleranceChange"
            active-color="#FF9500"
            :background-color="userStore.settings.darkMode ? '#3A3A3C' : '#E5E5EA'"
            block-color="#FF9500"
          />
          <text class="tolerance-value">{{ habit.tolerance }} 次</text>
        </view>
      </view>
    </view>

    <!-- 删除按钮 -->
    <button v-if="isEdit" class="delete-btn" @click="deleteHabit">删除习惯</button>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue'
import { useHabitStore } from '@/store/modules/habits'
import { useUserStore } from '@/store/modules/user'

const habitStore = useHabitStore()
const userStore = useUserStore()

const isEdit = ref(false)
const habitId = ref(null)

const icons = ['🛏️', '🚰', '📚', '🏃', '🧘', '🥗', '💧', '📱', '🚬', '🍺', '🎮', '📺']
const colors = ['#FFFFFF', '#FFEBEE', '#F3E5F5', '#E3F2FD', '#E0F2F1', '#FFFDE7', '#FFF3E0', '#FBE9E7', '#F5F5F5', '#CFD8DC']
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const habit = ref({
  name: '',
  icon: '📋',
  color: '#FFFFFF',
  category: 'life',
  frequency: 'daily',
  weekDays: [0, 1, 2, 3, 4, 5, 6],
  reminderTime: '08:00',
  coins: 1,
  isBad: false,
  tolerance: 3,
  currentTolerance: 0
})

onLoad((options) => {
  if (options.id) {
    isEdit.value = true
    habitId.value = options.id
    const existing = habitStore.habits.find(h => h.id === options.id)
    if (existing) {
      habit.value = { ...existing }
      if (!habit.value.color) habit.value.color = '#FFFFFF'
    }
  }
})

const toggleWeekDay = (day) => {
  const index = habit.value.weekDays.indexOf(day)
  if (index > -1) {
    habit.value.weekDays.splice(index, 1)
  } else {
    habit.value.weekDays.push(day)
    habit.value.weekDays.sort()
  }
}

const onTimeChange = (e) => {
  habit.value.reminderTime = e.detail.value
}

const onCoinChange = (e) => {
  habit.value.coins = e.detail.value
}

const onToleranceChange = (e) => {
  habit.value.tolerance = e.detail.value
}

const saveHabit = () => {
  if (!habit.value.name.trim()) {
    uni.showToast({ title: '请输入习惯名称', icon: 'none' })
    return
  }

  if (isEdit.value) {
    const index = habitStore.habits.findIndex(h => h.id === habitId.value)
    if (index !== -1) {
      habitStore.habits[index] = { ...habit.value }
      habitStore.save()
    }
  } else {
    habitStore.createHabit(habit.value)
  }

  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

const deleteHabit = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个习惯吗？相关记录也将被清除。',
    success: (res) => {
      if (res.confirm) {
        const index = habitStore.habits.findIndex(h => h.id === habitId.value)
        if (index !== -1) {
          habitStore.habits.splice(index, 1)
          habitStore.save()
        }
        uni.navigateBack()
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 40rpx;
  transition: background-color 0.3s;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 20rpx;
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s;
}

.back { font-size: 40rpx; padding: 10rpx; color: var(--text-primary); }
.title { font-size: 34rpx; font-weight: bold; color: var(--text-primary); }
.save { color: #007AFF; font-size: 32rpx; font-weight: 600; padding: 10rpx; }

.form {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-bottom: 20rpx;
  font-weight: 500;
}

.input {
  background: var(--card-bg);
  height: 100rpx;
  border-radius: 24rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.icon-scroll, .color-scroll {
  white-space: nowrap;
  width: 100%;
}

.icon-list, .color-list {
  display: flex;
  gap: 20rpx;
}

.icon-item {
  width: 100rpx;
  height: 100rpx;
  background: var(--card-bg);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  transition: all 0.2s;
  border: 4rpx solid transparent;
}

.icon-item.active {
  border-color: #007AFF;
  background: var(--btn-bg-secondary);
}

.color-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid var(--border-color);
  margin-right: 20rpx;
  position: relative;
  transition: all 0.2s;
}

.color-item.active {
  border-color: #007AFF;
  transform: scale(1.1);
}

.color-check {
  color: #007AFF;
  font-weight: bold;
}

.type-selector {
  display: flex;
  gap: 20rpx;
}

.type-option {
  flex: 1;
  padding: 30rpx;
  background: var(--icon-bg-default);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
  transition: all 0.3s;
  
  &.active {
    background: #34C759;
    color: white;
  }
  
  &.bad.active {
    background: #FF3B30;
  }
}

.type-icon {
  font-size: 40rpx;
}

.freq-selector {
  display: flex;
  gap: 20rpx;
}

.freq-option {
  flex: 1;
  padding: 24rpx;
  background: var(--icon-bg-default);
  border-radius: 16rpx;
  text-align: center;
  font-size: 30rpx;
  color: var(--text-secondary);
  transition: all 0.3s;
  
  &.active {
    background: #007AFF;
    color: white;
  }
}

.week-days {
  display: flex;
  justify-content: space-between;
}

.day-tag {
  width: 72rpx;
  height: 72rpx;
  background: var(--icon-bg-default);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--text-secondary);
  transition: all 0.3s;
  
  &.active {
    background: #007AFF;
    color: white;
  }
}

.picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: var(--text-primary);
}

.arrow {
  color: var(--text-secondary);
  font-size: 32rpx;
}

.coin-slider, .tolerance-slider {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.coin-value, .tolerance-value {
  font-size: 32rpx;
  color: #FFD700;
  font-weight: 600;
  min-width: 120rpx;
  text-align: right;
}

.coin-value.bad {
  color: #FF3B30;
}

.delete-btn {
  margin: 40rpx 30rpx;
  height: 96rpx;
  background: #FF3B30;
  color: white;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}
</style>