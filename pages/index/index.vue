<template>
  <view class="container">
    <!-- 顶部日历区域 -->
    <view class="header">
      <view class="header-top">
        <!-- 左上角图标 -->
        <view class="logo-icon">
          <text class="sparkle-icon">✨</text>
          <view v-if="habitStore.currentStreak > 0" class="streak-count">{{ habitStore.currentStreak }}</view>
        </view>
        
        <!-- 中间日期 -->
        <view class="date-display">
          <text class="date-text">{{ currentDate }}</text>
          <text class="week-text">{{ currentWeekDay }}</text>
        </view>
        
        <!-- 右上角更多 -->
        <view class="more-btn">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
      
      <!-- 周日历组件 -->
      <CalendarStrip 
        :selected-date="selectedDate"
        @change="onDateChange"
      />
      
      <!-- 今日任务统计 -->
      <view class="today-summary" @click="toggleTodoExpand">
        <view class="summary-left">
          <text class="summary-text">今日安排</text>
          <view class="count-badge" v-if="todayPendingCount > 0">{{ todayPendingCount }}</view>
        </view>
        <text class="arrow-up" :class="{ rotated: isTodoExpanded }">⌄</text>
      </view>
    </view>
    
    <!-- 时间线列表 -->
    <scroll-view 
      class="timeline-content" 
      scroll-y 
      :style="{ height: scrollHeight + 'px' }"
    >
      <!-- 今日待办 (Todos) -->
      <view class="unscheduled-section">
        <TaskCard 
          v-for="task in displayedTodos" 
          :key="task.id"
          :task="task"
          type="unscheduled"
          @click="onTaskClick"
          @toggle="onTaskClick"
        />
      </view>
      
      <!-- 时间线 (Habits) -->
      <view class="timeline-section">
        <TimelineItem 
          v-for="(item, index) in timelineItems" 
          :key="item.task.id"
          :time="item.time"
          :task="item.task"
          @toggle="onTaskClick"
          @click="onTaskClick"
        />
      </view>
      
      <!-- 底部占位 -->
      <view style="height: 120rpx;"></view>
    </scroll-view>

    <!-- Fireworks Animation -->
    <fireworks ref="fireworksRef" />

    <!-- Modals -->
    <add-task-modal
      :show="showTaskModal"
      :edit-data="editingTask"
      @update:show="showTaskModal = $event"
      @confirm="handleTaskConfirm"
    />

    <add-habit-modal
      :show="showHabitModal"
      :edit-data="editingHabit"
      @update:show="showHabitModal = $event"
      @confirm="handleHabitConfirm"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onShow } from 'vue'
import { useUserStore } from '@/store/modules/user'
import CalendarStrip from '@/components/calendar-strip/calendar-strip.vue'
import TaskCard from '@/components/task-card/task-card.vue'
import TimelineItem from '@/components/timeline-item/timeline-item.vue'
import AddTaskModal from '@/components/add-task-modal/add-task-modal.vue'
import AddHabitModal from '@/components/add-habit-modal/add-habit-modal.vue'
import Fireworks from '@/components/fireworks/fireworks.vue'
import { useHabitStore } from '@/store/modules/habits'
import { useTaskStore } from '@/store/modules/tasks'
import { onShow as useOnShow } from '@dcloudio/uni-app'

const habitStore = useHabitStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

const fireworksRef = ref(null)

const selectedDate = ref(new Date())
const scrollHeight = ref(600)

const currentDate = ref('')
const currentWeekDay = ref('')

// Modals state
const showTaskModal = ref(false)
const editingTask = ref(null)
const showHabitModal = ref(false)
const editingHabit = ref(null)

const isTodoExpanded = ref(true) // Default to expanded to see tasks immediately

// 更新日期显示
const updateDateDisplay = () => {
  const date = selectedDate.value
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  
  currentDate.value = `${month}月${day}日`
  currentWeekDay.value = weekDays[date.getDay()]
}

const onDateChange = (date) => {
  selectedDate.value = date
  updateDateDisplay()
}

// 格式化当前选中日期为 YYYY-MM-DD
const formattedDate = computed(() => {
  const date = selectedDate.value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

// Force refresh tasks on show
useOnShow(() => {
  taskStore.loadTasks() // Ensure we have latest data
  habitStore.init()
})

// Handle clicks (Check-in for habits, Edit for todos)
const onTaskClick = (data) => {
  const task = data.task || data
  const nativeEvent = data.event || data.nativeEvent
  
  if (task.type === 'todo') {
    const wasPending = task.status !== 'completed'
    taskStore.toggleTask(task.id)
    
    // If it WAS pending (now completed), show fireworks
    if (wasPending && nativeEvent) {
      triggerFireworks(nativeEvent)
    }
    
  } else if (task.type === 'habit') {
    // Habits check-in directly on click
    const wasPending = task.status !== 'completed'
    
    // Check-in (toggle)
    const success = habitStore.checkIn(task.id, formattedDate.value)
    
    // If it WAS pending (now completed), show fireworks
    if (wasPending && success && nativeEvent) {
       triggerFireworks(nativeEvent)
    }
  }
}

const triggerFireworks = (nativeEvent) => {
  let x, y
  if (nativeEvent.detail && typeof nativeEvent.detail.x === 'number') {
    x = nativeEvent.detail.x
    y = nativeEvent.detail.y
  } else if (nativeEvent.touches && nativeEvent.touches.length > 0) {
    x = nativeEvent.touches[0].clientX
    y = nativeEvent.touches[0].clientY
  } else if (nativeEvent.changedTouches && nativeEvent.changedTouches.length > 0) {
      x = nativeEvent.changedTouches[0].clientX
      y = nativeEvent.changedTouches[0].clientY
  }
  
  if (x !== undefined && y !== undefined && fireworksRef.value) {
    fireworksRef.value.show(x, y)
  }
}

const handleTaskConfirm = (data) => {
  if (data.id) {
    taskStore.updateTask(data)
  } else {
    // Should not happen here usually, but good to have
    taskStore.addTask(data)
  }
}

const handleHabitConfirm = (data) => {
  if (data.id) {
    habitStore.updateHabit(data)
  } else {
    habitStore.createHabit(data)
  }
}

// 今日待办逻辑
const todayAllTodos = computed(() => {
  return taskStore.tasks.filter(task => 
    task.type === 'todo' && 
    task.date === formattedDate.value
  )
})

const todayPendingCount = computed(() => {
  return todayAllTodos.value.filter(t => t.status !== 'completed').length
})

const displayedTodos = computed(() => {
  if (isTodoExpanded.value) {
    return todayAllTodos.value
  }
  return []
})

const toggleTodoExpand = () => {
  isTodoExpanded.value = !isTodoExpanded.value
}

// 检查习惯今日是否已完成
const isHabitCompleted = (habit) => {
  if (!habit.lastCompletedDate) return false
  const today = formattedDate.value
  return habit.lastCompletedDate.startsWith(today)
}

// 时间线数据 (习惯)
const timelineItems = computed(() => {
  const dayOfWeek = selectedDate.value.getDay() // 0-6
  
  // 筛选当天的习惯
  const activeHabits = habitStore.habits.filter(habit => {
    // 检查是否在重复周期内
    if (habit.weekDays && !habit.weekDays.includes(dayOfWeek)) return false
    // 必须有提醒时间才能在时间线显示
    if (!habit.reminderTime) return false
    return true
  })

  // 映射为时间线格式
  const items = activeHabits.map(habit => {
    // Calculate frequency label
    let freqLabel = '每天'
    if (habit.weekDays) {
      const len = habit.weekDays.length
      if (len === 7) freqLabel = '每天'
      else if (len === 5 && !habit.weekDays.includes(0) && !habit.weekDays.includes(6)) freqLabel = '工作日'
      else if (len === 2 && habit.weekDays.includes(0) && habit.weekDays.includes(6)) freqLabel = '周末'
      else freqLabel = '自定义'
    }

    return {
      time: habit.reminderTime,
      task: {
        id: habit.id,
        title: habit.name,
        type: 'habit',
        icon: habit.icon,
        reward: habit.coins,
        status: isHabitCompleted(habit) ? 'completed' : 'pending',
        color: habit.color || '#4A90E2',
        lastCompletedDate: habit.lastCompletedDate,
        subtitle: `${freqLabel} · 目标 ${habit.goal || 1} 次`
      }
    }
  })

  // 按时间排序
  return items.sort((a, b) => {
    return a.time.localeCompare(b.time)
  })
})

onMounted(() => {
  habitStore.init()
  updateDateDisplay()
  
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = systemInfo.windowHeight - 200
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: var(--bg-color);
  transition: background-color 0.3s;
}

.header {
  background: var(--card-bg);
  padding: 20rpx 30rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
  transition: background-color 0.3s;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.logo-icon {
  min-width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FFE5B4, #FFD93D);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  gap: 4rpx;
  
  .sparkle-icon {
    font-size: 36rpx;
  }
  
  .streak-count {
    font-size: 28rpx;
    font-weight: 600;
    color: #B45309;
  }
}

.date-display {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  
  .date-text {
    font-size: 36rpx;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .week-text {
    font-size: 28rpx;
    color: var(--text-secondary);
  }
}

.more-btn {
  display: flex;
  gap: 6rpx;
  padding: 20rpx;
  
  .dot {
    width: 8rpx;
    height: 8rpx;
    background: var(--text-secondary);
    border-radius: 50%;
  }
}

.today-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--icon-bg-default);
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  margin-top: 20rpx;
  transition: background-color 0.3s;
  
  .summary-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .summary-text {
    font-size: 28rpx;
    color: var(--text-secondary);
  }
  
  .count-badge {
    width: 40rpx;
    height: 40rpx;
    background: #4A90E2;
    color: #FFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
  }
  
  .arrow-up {
    font-size: 32rpx;
    color: var(--text-secondary);
    transition: transform 0.3s;
    
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.timeline-content {
  padding: 20rpx 30rpx;
}

.unscheduled-section {
  margin-bottom: 30rpx;
}

.timeline-section {
  position: relative;
}
</style>
