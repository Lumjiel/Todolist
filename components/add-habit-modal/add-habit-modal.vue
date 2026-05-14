<template>
  <uni-popup ref="popupRef" type="bottom" @change="onPopupChange">
    <view class="modal-content">
      <!-- 顶部拖拽条 -->
      <view class="drag-handle-bar">
        <view class="drag-handle"></view>
      </view>

      <view class="modal-header">
        <view class="header-left" @click="close">
          <text class="cancel-text">取消</text>
        </view>
        <text class="modal-title">{{ isEdit ? '编辑习惯' : '添加习惯' }}</text>
        <view class="header-right" @click="submit">
          <text class="save-text" :style="{ color: form.color }">保存</text>
        </view>
      </view>
      
      <scroll-view scroll-y class="form-scroll">
        <!-- 习惯名称 -->
        <view class="input-card">
          <text class="input-label">习惯名称</text>
          <input 
            v-model="form.name" 
            class="main-input" 
            placeholder="例如：早起、喝水、阅读" 
            placeholder-class="placeholder"
            :adjust-position="false"
          />
        </view>

        <!-- 习惯类型 & 奖励金币 -->
        <view class="row-section">
          <view class="half-card">
            <text class="input-label">习惯类型</text>
            <view class="type-switch">
              <view 
                class="type-btn" 
                :class="{ active: !form.isBad }"
                @click="form.isBad = false"
              >
                养成
              </view>
              <view 
                class="type-btn" 
                :class="{ active: form.isBad }"
                @click="form.isBad = true"
              >
                戒除
              </view>
            </view>
          </view>
          
          <view class="half-card">
            <text class="input-label">奖励金币</text>
            <view class="stepper simple">
              <view class="step-btn" @click="decrementCoins">−</view>
              <text class="step-val">{{ form.coins }}</text>
              <view class="step-btn" @click="incrementCoins">+</view>
            </view>
          </view>
        </view>

        <!-- 分类选择 -->
        <view class="section">
          <view class="section-title">
            <view class="title-bar purple"></view>
            <text>所属分类</text>
          </view>
          <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
            <view class="category-list">
              <view 
                v-for="cat in categories" 
                :key="cat.id"
                class="category-chip"
                :class="{ active: form.category === cat.id }"
                :style="{ 
                  background: form.category === cat.id ? form.color : '#F5F7FA',
                  color: form.category === cat.id ? '#fff' : '#666'
                }"
                @click="form.category = cat.id"
              >
                <text class="cat-icon">{{ cat.icon }}</text>
                <text>{{ cat.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 选择图标 -->
        <view class="section">
          <view class="section-title">
            <view class="title-bar blue"></view>
            <text>选择图标</text>
          </view>
          <view class="icon-grid">
            <view 
              v-for="icon in commonIcons" 
              :key="icon"
              class="icon-item"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              <text class="icon-text">{{ icon }}</text>
              <view v-if="form.icon === icon" class="active-ring" :style="{ borderColor: form.color }"></view>
            </view>
          </view>
        </view>
        
        <!-- 主题颜色 -->
        <view class="section">
          <view class="section-title">
            <view class="title-bar purple"></view>
            <text>主题颜色</text>
          </view>
          <scroll-view scroll-x class="color-scroll" show-scrollbar="false">
            <view class="color-list">
              <view 
                v-for="color in themeColors" 
                :key="color"
                class="color-item"
                :class="{ active: form.color === color }"
                :style="{ background: color }"
                @click="form.color = color"
              >
                <view v-if="form.color === color" class="color-check">✓</view>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 重复频率 -->
        <view class="section">
          <view class="section-title">
            <view class="title-bar green"></view>
            <text>重复频率</text>
          </view>
          <view class="freq-list">
            <view 
              v-for="opt in freqOptions" 
              :key="opt.value"
              class="freq-pill"
              :class="{ active: form.frequency === opt.value }"
              :style="{ 
                background: form.frequency === opt.value ? form.color : '#F5F5F5',
                color: form.frequency === opt.value ? '#fff' : '#666'
              }"
              @click="onFreqChange(opt.value)"
            >
              {{ opt.label }}
            </view>
          </view>

          <!-- Custom Days Selector -->
          <view v-if="form.frequency === 'custom'" class="custom-days-wrap">
            <view 
              v-for="day in weekDayOptions" 
              :key="day.value"
              class="day-circle"
              :class="{ active: form.weekDays.includes(day.value) }"
              :style="{ 
                background: form.weekDays.includes(day.value) ? form.color : '#F5F5F5',
                color: form.weekDays.includes(day.value) ? '#fff' : '#666'
              }"
              @click="toggleWeekDay(day.value)"
            >
              {{ day.label }}
            </view>
          </view>
        </view>
        
        <!-- 目标设置 -->
        <view class="section">
          <view class="section-title">
            <view class="title-bar orange"></view>
            <text>{{ form.isBad ? '戒除设置' : '目标设置' }}</text>
          </view>
          
          <view class="setting-card">
            <!-- 每日目标次数 / 容忍度 -->
            <view class="setting-row">
              <text class="setting-label">{{ form.isBad ? '每日容忍次数' : '每日目标次数' }}</text>
              <view class="stepper">
                <view class="step-btn minus" @click="decrementGoal">−</view>
                <text class="step-val">{{ form.goal }}</text>
                <view class="step-btn plus" @click="incrementGoal">+</view>
              </view>
            </view>
            
            <view class="divider"></view>

            <!-- 提醒时间 -->
            <view class="setting-row">
              <text class="setting-label">提醒时间</text>
              <picker mode="time" :value="form.reminderTime" @change="onTimeChange">
                <view class="time-picker-wrap">
                  <text class="time-val" :class="{ placeholder: !form.reminderTime }">
                    {{ form.reminderTime || '设置时间' }}
                  </text>
                  <text class="clock-icon">🕒</text>
                </view>
              </picker>
            </view>

            <view class="divider"></view>
            
            <!-- 开启提醒 -->
            <view class="setting-row">
              <text class="setting-label">开启提醒</text>
              <switch 
                :checked="!!form.reminderTime" 
                @change="onReminderChange" 
                :color="form.color" 
                style="transform: scale(0.8)"
              />
            </view>
          </view>
        </view>
        
        <view style="height: 240rpx;"></view>
      </scroll-view>

      <!-- 实时预览卡片 -->
      <view class="preview-container">
        <view class="preview-label">实时预览</view>
        <view class="habit-preview-card" :style="{ background: form.color }">
          <view class="preview-left">
            <view class="preview-icon-box" :style="{ background: 'rgba(255,255,255,0.2)' }">
              <text class="preview-icon">{{ form.icon }}</text>
            </view>
            <view class="preview-info">
              <text class="preview-name" style="color: #fff">{{ form.name || '习惯名称' }}</text>
              <text class="preview-desc" style="color: rgba(255,255,255,0.8)">每天 · 目标 {{ form.goal }} 次</text>
            </view>
          </view>
          <view class="preview-check">
            <view class="check-circle-mock" :style="{ borderColor: 'rgba(255,255,255,0.5)' }">
              <text style="color: rgba(255,255,255,0.8)">✓</text>
            </view>
          </view>
        </view>
      </view>

    </view>
  </uni-popup>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useHabitStore } from '@/store/modules/habits'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const habitStore = useHabitStore()
const categories = computed(() => habitStore.categories)

const popupRef = ref(null)

const isEdit = computed(() => !!props.editData)

const commonIcons = ['⏰','💧','📚','🏃','🧘','🥗','💪','😴','🎸','💊','🦷','✍️','🧹','📵','📝','🎨','🎧','🏸','🏊','🚲']
const themeColors = ['#4A90E2', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#FF8B94', '#A8D8EA', '#F3A683', '#6C5CE7', '#FD79A8']

const freqOptions = [
  { label: '每天', value: 'daily' },
  { label: '工作日', value: 'workdays' },
  { label: '周末', value: 'weekends' },
  { label: '每周一次', value: 'weekly' },
  { label: '自定义', value: 'custom' }
]

const weekDayOptions = [
  { label: '日', value: 0 },
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 }
]

const form = ref({
  name: '',
  icon: '⏰',
  color: '#4A90E2',
  category: 'life',
  frequency: 'daily',
  weekDays: [0, 1, 2, 3, 4, 5, 6],
  reminderTime: '08:00',
  goal: 1,
  coins: 1,
  isBad: false
})

watch(() => props.show, async (newVal) => {
  if (newVal) {
    if (props.editData) {
      const data = JSON.parse(JSON.stringify(props.editData))
      form.value = {
        ...data,
        // Ensure frequency is set correctly based on weekDays if not stored
        frequency: data.frequency || determineFrequency(data.weekDays),
        // Ensure category is set
        category: data.category || 'life'
      }
    } else {
      // Reset defaults
      form.value = {
        name: '',
        icon: '⏰',
        color: '#4A90E2',
        category: 'life',
        frequency: 'daily',
        weekDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '08:00',
        goal: 1,
        coins: 1,
        isBad: false
      }
    }
    await nextTick()
    popupRef.value?.open()
  } else {
    popupRef.value?.close()
  }
})

const determineFrequency = (weekDays) => {
  if (!weekDays || weekDays.length === 7) return 'daily'
  if (weekDays.length === 5 && !weekDays.includes(0) && !weekDays.includes(6)) return 'workdays'
  if (weekDays.length === 2 && weekDays.includes(0) && weekDays.includes(6)) return 'weekends'
  if (weekDays.length === 1) return 'weekly'
  return 'custom'
}

const toggleWeekDay = (day) => {
  const index = form.value.weekDays.indexOf(day)
  if (index > -1) {
    // Don't allow empty selection
    if (form.value.weekDays.length > 1) {
      form.value.weekDays.splice(index, 1)
    }
  } else {
    form.value.weekDays.push(day)
    form.value.weekDays.sort()
  }
}

const onFreqChange = (val) => {
  form.value.frequency = val
  switch (val) {
    case 'daily':
      form.value.weekDays = [0, 1, 2, 3, 4, 5, 6]
      break
    case 'workdays':
      form.value.weekDays = [1, 2, 3, 4, 5]
      break
    case 'weekends':
      form.value.weekDays = [0, 6]
      break
    case 'weekly':
      form.value.weekDays = [new Date().getDay()]
      break
    case 'custom':
      // Keep current selection or reset to all if empty
      if (form.value.weekDays.length === 0) {
        form.value.weekDays = [0, 1, 2, 3, 4, 5, 6]
      }
      break
  }
}

const onPopupChange = (e) => {
  if (!e.show) {
    emit('update:show', false)
  }
}

const onReminderChange = (e) => {
  if (e.detail.value) {
    if (!form.value.reminderTime) {
      form.value.reminderTime = '08:00'
    }
  } else {
    form.value.reminderTime = null
  }
}

const incrementGoal = () => {
  form.value.goal++
}

const decrementGoal = () => {
  if (form.value.goal > 1) {
    form.value.goal--
  }
}

const incrementCoins = () => {
  if (form.value.coins < 100) form.value.coins++
}

const decrementCoins = () => {
  if (form.value.coins > 1) form.value.coins--
}

const onTimeChange = (e) => {
  form.value.reminderTime = e.detail.value
}

const close = () => {
  popupRef.value?.close()
  emit('update:show', false)
}

const submit = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入习惯名称', icon: 'none' })
    return
  }

  const submitData = {
    ...form.value,
    id: props.editData?.id,
    // weekDays is already up-to-date from interactions
    weekDays: form.value.weekDays,
    // If it's a bad habit, map goal to tolerance
    tolerance: form.value.isBad ? form.value.goal : 0
  }

  emit('confirm', submitData)
  close()
}

defineExpose({
  open: () => popupRef.value?.open(),
  close: () => popupRef.value?.close()
})
</script>

<style lang="scss" scoped>
.modal-content {
  background: #F8F9FE;
  border-radius: 40rpx 40rpx 0 0;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.drag-handle-bar {
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.drag-handle {
  width: 80rpx;
  height: 8rpx;
  background: #E0E0E0;
  border-radius: 4rpx;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 32rpx 30rpx;
}

.cancel-text {
  font-size: 30rpx;
  color: #999;
}

.save-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #4A90E2;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
}

.form-scroll {
  flex: 1;
  height: 0; /* Important: prevents flex item from overflowing parent */
  padding: 0 32rpx;
  box-sizing: border-box;
}

.input-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
}

.row-section {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.half-card {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
}

.type-switch {
  display: flex;
  background: #F5F7FA;
  border-radius: 16rpx;
  padding: 6rpx;
  margin-top: 16rpx;
}

.type-btn {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  padding: 12rpx 0;
  border-radius: 12rpx;
  transition: all 0.2s;
  
  &.active {
    background: #fff;
    color: #333;
    font-weight: 600;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  }
}

.stepper.simple {
  margin-top: 16rpx;
  background: #F5F7FA;
  padding: 6rpx 12rpx;
}

.category-scroll {
  width: 100%;
  white-space: nowrap;
}

.category-list {
  display: flex;
  gap: 20rpx;
  padding: 4rpx;
}

.category-chip {
  padding: 12rpx 24rpx;
  background: #F5F7FA;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s;
  
  .cat-icon {
    font-size: 30rpx;
  }
  
  &.active {
    transform: scale(1.05);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  }
}

.input-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
}

.main-input {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  height: 60rpx;
}

.placeholder {
  color: #ccc;
  font-weight: 400;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  gap: 16rpx;
  
  text {
    font-size: 30rpx;
    font-weight: 700;
    color: #333;
  }
}

.title-bar {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  
  &.blue { background: #4A90E2; }
  &.purple { background: #9B59B6; }
  &.green { background: #2ECC71; }
  &.orange { background: #F39C12; }
}

/* Icon Grid */
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.icon-item {
  width: 100rpx;
  height: 100rpx;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
  transition: all 0.2s;
  
  &.active {
    transform: scale(1.05);
  }
}

.icon-text {
  font-size: 48rpx;
}

.active-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 4rpx solid #4A90E2;
  border-radius: 24rpx;
}

/* Color List */
.color-scroll {
  width: 100%;
  white-space: nowrap;
}

.color-list {
  display: flex;
  gap: 24rpx;
  padding: 10rpx 4rpx;
}

.color-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  transition: all 0.2s;
  border: 4rpx solid transparent;
  
  &:active {
    transform: scale(0.9);
  }

  &.active {
    transform: scale(1.1);
    box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.15);
  }
}

.color-check {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

/* Freq Pills */
.freq-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.freq-pill {
  padding: 16rpx 32rpx;
  background: #F5F5F5;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.custom-days-wrap {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  background: #fff;
  padding: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
}

.day-circle {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.9);
  }
}

/* Goal Settings */
.setting-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 0 30rpx;
}

.setting-row {
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.divider {
  height: 1rpx;
  background: #f5f5f5;
  width: 100%;
}

.setting-label {
  font-size: 30rpx;
  color: #333;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #F5F7FA;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.step-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #666;
  font-weight: bold;
}

.step-val {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  min-width: 40rpx;
  text-align: center;
}

.time-picker-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #F5F7FA;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
}

.time-val {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  
  &.placeholder {
    color: #999;
    font-weight: 400;
  }
}

.clock-icon {
  font-size: 32rpx;
}

/* Preview Card */
.preview-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx 50rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
  z-index: 10;
}

.preview-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.habit-preview-card {
  background: #2C2C2E;
  border-radius: 32rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.15);
  transition: all 0.3s;
  
  &.bad-habit {
    background: #1C1C1E;
    border: 2rpx dashed #FF3B30;
    
    .preview-name {
      color: #FF3B30;
    }
  }
}

.preview-coin {
  margin-left: 8rpx;
  color: #FFD700;
  font-weight: 600;
}

.preview-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.preview-icon-box {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 144, 226, 0.2);
}

.preview-icon {
  font-size: 40rpx;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.preview-name {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.preview-desc {
  color: #8E8E93;
  font-size: 24rpx;
}

.check-circle-mock {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>