<template>
  <view class="timeline-item">
    <!-- 时间 -->
    <view class="time-column">
      <text class="time-text">{{ time }}</text>
      <view class="time-dot" :style="{ borderColor: task.color || '#4A90E2' }"></view>
      <view class="time-line"></view>
    </view>
    
    <!-- 任务卡片 -->
    <view class="task-wrapper">
      <TaskCard 
        :task="task" 
        :show-time="false" 
        @toggle="$emit('toggle', $event)" 
        @click="onClick"
      />
    </view>
  </view>
</template>

<script setup>
import TaskCard from '../task-card/task-card.vue'

const props = defineProps({
  time: {
    type: String,
    required: true
  },
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'click'])

const onClick = (data) => {
  // Pass through the event data from TaskCard
  // If data is just task (old behavior), wrap it? 
  // TaskCard now emits { task, event }.
  // But wait, if TaskCard emits { task, event }, `data` here IS that object.
  // We want to pass it up.
  emit('click', data)
}
</script>

<style lang="scss" scoped>
.timeline-item {
  display: flex;
  margin-bottom: 30rpx;
}

.time-column {
  width: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 20rpx;
}

.time-text {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.time-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  border: 4rpx solid #4A90E2;
  background: #FFF;
  z-index: 2;
}

.time-line {
  position: absolute;
  top: 60rpx;
  bottom: -40rpx;
  width: 2rpx;
  background: #E8E8E8;
  z-index: 1;
}

.task-wrapper {
  flex: 1;
  margin-left: 20rpx;
  margin-right: 24rpx; /* Add right margin to ensure checkmark is visible */
}
</style>