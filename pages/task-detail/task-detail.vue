<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="goBack">←</text>
      <text class="title">{{ isEdit ? '编辑任务' : '新建任务' }}</text>
      <text class="save" @click="saveTask">保存</text>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form-item">
        <text class="label">任务名称</text>
        <input 
          v-model="task.title"
          placeholder="输入任务名称..."
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label">标签分类</text>
        <view class="tag-list">
          <view 
            v-for="tag in tags" 
            :key="tag"
            class="tag"
            :class="{ 'active': task.tag === tag }"
            @click="task.tag = tag"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">优先级</text>
        <view class="priority-list">
          <view 
            v-for="p in priorities" 
            :key="p.value"
            class="priority"
            :class="{ 'active': task.priority === p.value }"
            @click="task.priority = p.value"
          >
            <text class="p-label">{{ p.label }}</text>
            <text class="p-desc">{{ p.desc }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">时间设置</text>
        <view class="time-settings">
          <picker mode="date" :value="task.date" @change="onDateChange">
            <view class="picker">
              <text>日期: {{ task.date }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
          <picker mode="time" :value="task.time" @change="onTimeChange">
            <view class="picker">
              <text>时间: {{ task.time || '未设置' }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
        </view>
      </view>

      <view class="form-item">
        <text class="label">奖励金币</text>
        <view class="coin-slider">
          <slider 
            :value="task.coins" 
            min="1" 
            max="10" 
            @change="onCoinChange"
            activeColor="#FFD700"
            backgroundColor="#E5E5EA"
            block-color="#FFD700"
          />
          <text class="coin-value">{{ task.coins }} 金币</text>
        </view>
      </view>
    </view>

    <!-- 删除按钮 -->
    <button v-if="isEdit" class="delete-btn" @click="deleteTask">删除任务</button>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue'
import { useTaskStore } from '@/store/modules/tasks'

const taskStore = useTaskStore()

const isEdit = ref(false)
const taskId = ref(null)

const task = ref({
  title: '',
  tag: '无标签',
  priority: 3,
  date: new Date().toISOString().split('T')[0],
  time: '',
  coins: 2,
  description: ''
})

const tags = ['无标签', '人生思考', '工作', '生活', '学习']
const priorities = [
  { value: 1, label: 'P1', desc: '紧急重要' },
  { value: 2, label: 'P2', desc: '重要不紧急' },
  { value: 3, label: 'P3', desc: '普通任务' }
]

onLoad((options) => {
  if (options.id) {
    isEdit.value = true
    taskId.value = options.id
    const existing = taskStore.tasks.find(t => t.id === options.id)
    if (existing) {
      task.value = { ...existing }
    }
  }
})

const onDateChange = (e) => {
  task.value.date = e.detail.value
}

const onTimeChange = (e) => {
  task.value.time = e.detail.value
}

const onCoinChange = (e) => {
  task.value.coins = e.detail.value
}

const saveTask = () => {
  if (!task.value.title.trim()) {
    uni.showToast({ title: '请输入任务名称', icon: 'none' })
    return
  }

  if (isEdit.value) {
    // 更新现有任务
    const index = taskStore.tasks.findIndex(t => t.id === taskId.value)
    if (index !== -1) {
      taskStore.tasks[index] = { ...task.value }
      taskStore.save()
    }
  } else {
    // 创建新任务
    taskStore.createTask(task.value)
  }

  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

const deleteTask = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个任务吗？',
    success: (res) => {
      if (res.confirm) {
        const index = taskStore.tasks.findIndex(t => t.id === taskId.value)
        if (index !== -1) {
          taskStore.tasks.splice(index, 1)
          taskStore.save()
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
  background: #F2F2F7;
  padding: 40rpx 0 100rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx 30rpx;
}

.back {
  font-size: 40rpx;
  color: #007AFF;
  padding: 10rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1C1C1E;
}

.save {
  font-size: 30rpx;
  color: #007AFF;
  font-weight: 600;
  padding: 10rpx;
}

.form {
  padding: 0 30rpx;
}

.form-item {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.label {
  font-size: 26rpx;
  color: #8E8E93;
  margin-bottom: 20rpx;
  display: block;
}

.input {
  font-size: 32rpx;
  color: #1C1C1E;
  height: 60rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 16rpx 32rpx;
  background: #F2F2F7;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
  
  &.active {
    background: #007AFF;
    color: white;
  }
}

.priority-list {
  display: flex;
  gap: 20rpx;
}

.priority {
  flex: 1;
  padding: 24rpx;
  background: #F2F2F7;
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s;
  
  &.active {
    background: #007AFF;
    color: white;
  }
  
  &.active .p-desc {
    color: rgba(255,255,255,0.8);
  }
}

.p-label {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.p-desc {
  font-size: 22rpx;
  color: #8E8E93;
}

.time-settings {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #1C1C1E;
  border-bottom: 2rpx solid #F2F2F7;
}

.arrow {
  color: #C7C7CC;
  font-size: 32rpx;
}

.coin-slider {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.coin-value {
  font-size: 32rpx;
  color: #FFD700;
  font-weight: 600;
  min-width: 120rpx;
  text-align: right;
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