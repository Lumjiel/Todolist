<template>
  <view class="task-card" :class="{ completed: displayCompleted, 'colored-card': isColored }" :style="cardStyle" @click="onClick">
    <view class="card-bg" v-if="displayWallpaper"></view>
    
    <!-- Colored Habit Layout -->
    <view class="card-content habit-layout" v-if="isColored">
      <view class="habit-left">
        <view class="habit-icon-box">
          <text class="habit-icon">{{ displayIcon }}</text>
        </view>
        <view class="habit-info">
          <text class="habit-title" :class="{ completed: displayCompleted }">{{ displayTitle }}</text>
          <text class="habit-subtitle">{{ displaySubtitle }}</text>
        </view>
      </view>
      <view class="check-circle" :class="{ checked: displayCompleted }" @click.stop="toggle($event)">
        <text v-if="displayCompleted" class="check-icon">✓</text>
      </view>
    </view>

    <!-- Standard Todo Layout -->
    <view class="card-content" v-else>
      <view v-if="displayIcon" class="icon-badge" :style="iconStyle">{{ displayIcon }}</view>
      <view v-else class="priority-badge" :class="`p${displayPriority}`">{{ displayPriority }}</view>
      <text class="task-title" :class="{ completed: displayCompleted }">{{ displayTitle }}</text>
      <view class="task-meta">
        <text class="task-date">{{ displayDate }}</text>
        <view v-if="displayIsRecurring" class="recurring-icon">🔄</view>
      </view>
      <view class="check-circle" :class="{ checked: displayCompleted }" @click.stop="toggle($event)">
        <text v-if="displayCompleted" class="check-icon">✓</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: Object,
  title: String,
  priority: {
    type: Number,
    default: 2
  },
  date: String,
  completed: Boolean,
  isRecurring: Boolean,
  wallpaper: String,
  color: String,
  subtitle: String,
  icon: String
})

const emit = defineEmits(['toggle', 'click'])

const displayTitle = computed(() => props.task?.title || props.title)
const displaySubtitle = computed(() => props.task?.subtitle || props.subtitle)
const displayPriority = computed(() => props.task?.priority ?? props.priority)
const displayIcon = computed(() => props.task?.icon || props.icon)
const displayDate = computed(() => props.task?.date || props.date)
const displayCompleted = computed(() => (props.task?.status === 'completed') || props.completed)
const displayIsRecurring = computed(() => props.task?.isRecurring || props.isRecurring)
const displayWallpaper = computed(() => props.task?.wallpaper || props.wallpaper)

const isColored = computed(() => {
  return !displayWallpaper.value && props.task?.type === 'habit' && props.task?.color
})

const cardStyle = computed(() => {
  if (displayWallpaper.value) {
    return {
      backgroundImage: `url(${displayWallpaper.value})`,
      backgroundSize: 'cover'
    }
  }
  if (isColored.value) {
    return {
      background: props.task.color,
      '--theme-color': props.task.color
    }
  }
  return {}
})

const onClick = (event) => {
  emit('click', { task: props.task, event })
}

const toggle = (event) => {
  emit('toggle', { task: props.task, event })
}
</script>

<style scoped>
.task-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  position: relative;
  overflow: hidden;
  min-height: 140rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.task-card.completed {
  opacity: 0.6;
  background: #F5F5F5;
  box-shadow: none;
}

.task-card.completed .priority-badge {
  background: #ccc !important;
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.3;
}

.card-content {
  position: relative;
  z-index: 1;
}

.icon-badge {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.priority-badge {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ff9800;
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.priority-badge.p1 { background: #f44336; }
.priority-badge.p2 { background: #ff9800; }
.priority-badge.p3 { background: #4caf50; }

.task-title {
  display: block;
  margin-left: 56rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8rpx;
  transition: all 0.3s ease;
}

.task-title.completed {
  color: #999;
  text-decoration: line-through;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-left: 56rpx;
}

.task-date {
  font-size: 22rpx;
  color: #999;
}

.recurring-icon {
  font-size: 20rpx;
}

.check-circle {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-circle.checked {
  background: #34C759;
  border-color: #34C759;
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
}

.task-card.colored-card .check-circle {
  /* Reset absolute positioning for flex layout in habit mode */
  /* We target specifically the one inside habit-layout via descendant selector if needed, 
     but since colored-card implies habit-layout (mostly), we can reset here or be more specific */
}

/* Habit Layout Styles */
.habit-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}

.habit-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.habit-icon-box {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.habit-icon {
  font-size: 40rpx;
}

.habit-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  justify-content: center;
  flex: 1; /* Allow it to shrink */
  min-width: 0; /* Prevent content from overflowing */
}

.habit-title,
.habit-subtitle {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.habit-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.2;
}

.habit-title.completed {
  text-decoration: line-through;
  opacity: 0.8;
}

.habit-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

/* Specific overrides for check circle in habit layout */
.habit-layout .check-circle {
  position: static;
  transform: none;
  width: 56rpx;
  height: 56rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.habit-layout .check-circle.checked {
  background: transparent; /* Keep transparent like preview */
  border-color: rgba(255, 255, 255, 0.8);
}

.habit-layout .check-circle.checked .check-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 32rpx; /* Larger check icon */
}

</style>