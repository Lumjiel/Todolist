<template>
  <view class="calendar-strip">
    <view 
      v-for="(day, index) in weekDays" 
      :key="index"
      class="day-item"
      :class="{ 'day-item-active': isSelected(day) }"
      @click="selectDate(day)"
    >
      <text class="day-name">{{ day.shortName }}</text>
      <view class="day-number-wrapper">
        <text class="day-number" :class="{ 'day-number-active': isSelected(day) }">
          {{ day.date }}
        </text>
      </view>
      <text v-if="isToday(day)" class="today-label">今天</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['change'])

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())
  
  const weekNames = ['日', '一', '二', '三', '四', '五', '六']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    
    days.push({
      fullDate: date,
      shortName: weekNames[i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
})

const isSelected = (day) => {
  return day.fullDate.toDateString() === props.selectedDate.toDateString()
}

const isToday = (day) => {
  return day.isToday
}

const selectDate = (day) => {
  emit('change', day.fullDate)
}
</script>

<style lang="scss" scoped>
.calendar-strip {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
  
  &:active {
    background: #F0F0F0;
  }
}

.day-item-active {
  .day-number-wrapper {
    background: #4A90E2;
  }
}

.day-name {
  font-size: 24rpx;
  color: #999;
}

.day-number-wrapper {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all 0.2s ease;
}

.day-number {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  
  &-active {
    color: #FFF;
    font-weight: 600;
  }
}

.today-label {
  font-size: 20rpx;
  color: #4A90E2;
}
</style>