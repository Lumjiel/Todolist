<template>
  <uni-popup ref="popupRef" type="bottom" @change="onPopupChange" :safe-area="false">
    <view class="modal-container">
      <!-- 顶部导航 -->
      <view class="modal-header">
        <view class="header-left" @click="close">
          <text class="cancel-text">取消</text>
        </view>
        <text class="header-title">{{ isEdit ? '编辑待办' : '新建待办' }}</text>
        <view class="header-right" @click="submit">
          <view class="save-btn">保存</view>
        </view>
      </view>
      
      <scroll-view scroll-y class="form-scroll">
        <view class="form-content">
          <!-- 任务标题 -->
          <view class="card input-card">
            <text class="card-label">任务标题</text>
            <input 
              v-model="form.title" 
              class="title-input" 
              placeholder="准备做什么?" 
              placeholder-class="placeholder"
            />
          </view>
          
          <!-- 备注说明 -->
          <view class="card input-card">
            <text class="card-label">备注说明</text>
            <textarea 
              v-model="form.description" 
              class="desc-input" 
              placeholder="添加详细描述..." 
              placeholder-class="placeholder"
              auto-height
            />
          </view>
          
          <!-- 选择标签 -->
          <view class="section-title">
            <text>选择标签</text>
            <view class="add-tag" @click="showToast('新建标签功能开发中')">+ 新建标签</view>
          </view>
          
          <view class="tags-grid">
            <view 
              v-for="tag in tags" 
              :key="tag.id"
              class="tag-item"
              :class="[tag.colorClass, { active: form.category === tag.name }]"
              @click="form.category = tag.name"
            >
              <view class="tag-icon">{{ tag.icon }}</view>
              <text class="tag-name">{{ tag.name }}</text>
              <view class="tag-count">{{ tag.count }}/{{ tag.total }}</view>
              <view class="check-circle" v-if="form.category === tag.name">✓</view>
            </view>
          </view>
          
          <!-- 优先级 -->
          <view class="section-title">优先级</view>
          <view class="priority-row">
            <view 
              v-for="p in priorities" 
              :key="p.value"
              class="priority-btn"
              :class="[p.class, { active: form.priority === p.value }]"
              @click="form.priority = p.value"
            >
              <view class="dot" :style="{ background: p.color }"></view>
              <text>{{ p.label }}</text>
            </view>
          </view>
          
          <!-- 截止日期 -->
          <view class="card date-card">
            <text class="card-label">截止日期</text>
            <view class="date-options">
              <view 
                class="date-opt" 
                :class="{ active: dateType === 'today' }"
                @click="setDate('today')"
              >今天</view>
              <view 
                class="date-opt" 
                :class="{ active: dateType === 'tomorrow' }"
                @click="setDate('tomorrow')"
              >明天</view>
              <view 
                class="date-opt" 
                :class="{ active: dateType === 'nextWeek' }"
                @click="setDate('nextWeek')"
              >下周</view>
              <picker mode="date" :value="form.date" @change="onDatePick">
                <view class="date-opt custom" :class="{ active: dateType === 'custom' }">
                  <text>📅 自定</text>
                </view>
              </picker>
            </view>
            
            <view class="divider"></view>
            
            <view class="time-row">
              <view class="time-label">
                <text class="icon">🕒</text>
                <text>提醒时间</text>
              </view>
              <picker mode="time" :value="form.time" @change="onTimePick">
                <view class="time-value">
                  {{ form.time || '09:00' }}
                  <text class="arrow">›</text>
                </view>
              </picker>
            </view>
          </view>
          
          <!-- 子任务 -->
          <view class="card subtask-card">
            <view class="card-header">
              <text class="card-label">子任务</text>
              <view class="add-sub-btn" @click="addSubtask">+ 添加</view>
            </view>
            
            <view class="subtask-list">
              <view v-for="(sub, index) in form.subtasks" :key="index" class="subtask-item">
                <view class="sub-icon">|</view>
                <input 
                  v-model="sub.title" 
                  class="sub-input" 
                  placeholder="子任务..." 
                  @confirm="addSubtask"
                />
                <text class="remove-sub" @click="removeSubtask(index)">✕</text>
              </view>
              <view v-if="form.subtasks.length === 0" class="empty-sub">
                暂无子任务
              </view>
            </view>
          </view>
          
          <!-- 底部留白 -->
          <view style="height: 60rpx;"></view>
        </view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:show', 'confirm'])
const popupRef = ref(null)
const isEdit = computed(() => !!props.editData)

// Data
const tags = [
  { id: 1, name: '无标签', icon: '🏷️', count: 0, total: 0, colorClass: 'gray' },
  { id: 2, name: '工作', icon: '💼', count: 1, total: 1, colorClass: 'red' },
  { id: 3, name: '生活', icon: '🏠', count: 0, total: 0, colorClass: 'blue' },
  { id: 4, name: '人生思考', icon: '🤔', count: 0, total: 0, colorClass: 'purple' }
]

const priorities = [
  { value: 3, label: '普通', color: '#3B82F6', class: 'normal' }, // Blue
  { value: 2, label: '重要', color: '#F59E0B', class: 'important' }, // Orange
  { value: 1, label: '紧急', color: '#EF4444', class: 'urgent' } // Red
]

const form = ref({
  title: '',
  description: '',
  tag: '无标签',
  priority: 3,
  date: '',
  time: '09:00',
  subtasks: [],
  coins: 2
})

const dateType = ref('today') // today, tomorrow, nextWeek, custom

// Watchers
watch(() => props.show, async (newVal) => {
  if (newVal) {
    if (props.editData) {
      form.value = JSON.parse(JSON.stringify(props.editData))
      // Normalize subtasks if missing
      if (!form.value.subtasks) form.value.subtasks = []
      // Infer dateType
      dateType.value = 'custom' 
    } else {
      resetForm()
    }
    await nextTick()
    popupRef.value?.open()
  } else {
    popupRef.value?.close()
  }
})

// Methods
const resetForm = () => {
  const today = new Date().toISOString().split('T')[0]
  form.value = {
    title: '',
    description: '',
    category: '无标签',
    priority: 3,
    date: today,
    time: '09:00',
    subtasks: [],
    coins: 2
  }
  dateType.value = 'today'
}

const onPopupChange = (e) => {
  if (!e.show) emit('update:show', false)
}

const close = () => {
  popupRef.value?.close()
  emit('update:show', false)
}

const submit = () => {
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入任务标题', icon: 'none' })
    return
  }
  emit('confirm', { ...form.value, id: props.editData?.id })
  close()
}

const setDate = (type) => {
  dateType.value = type
  const d = new Date()
  if (type === 'today') {
    // No change to d
  } else if (type === 'tomorrow') {
    d.setDate(d.getDate() + 1)
  } else if (type === 'nextWeek') {
    d.setDate(d.getDate() + 7)
  }
  form.value.date = d.toISOString().split('T')[0]
}

const onDatePick = (e) => {
  dateType.value = 'custom'
  form.value.date = e.detail.value
}

const onTimePick = (e) => {
  form.value.time = e.detail.value
}

const addSubtask = () => {
  form.value.subtasks.push({ title: '', completed: false })
}

const removeSubtask = (index) => {
  form.value.subtasks.splice(index, 1)
}

const showToast = (msg) => {
  uni.showToast({ title: msg, icon: 'none' })
}

defineExpose({
  open: () => popupRef.value?.open(),
  close: () => popupRef.value?.close()
})
</script>

<style lang="scss" scoped>
.modal-container {
  background: #F8FAFC;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  padding-top: calc(var(--status-bar-height) + 30rpx);
  background: #F8FAFC; /* Opaque background to cover underlying content */
  z-index: 10;
}

.header-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1E293B;
}

.cancel-text {
  font-size: 30rpx;
  color: #64748B;
}

.save-btn {
  background: #3B82F6;
  color: white;
  padding: 10rpx 32rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.form-scroll {
  flex: 1;
  height: 0;
}

.form-content {
  padding: 30rpx 40rpx;
}

.card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
}

.card-label {
  font-size: 26rpx;
  color: #64748B;
  margin-bottom: 20rpx;
  display: block;
  font-weight: 500;
}

.input-card {
  .title-input {
    font-size: 36rpx;
    font-weight: 600;
    color: #1E293B;
    height: 60rpx;
  }
  
  .desc-input {
    font-size: 30rpx;
    color: #334155;
    width: 100%;
    min-height: 120rpx;
    line-height: 1.5;
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 24rpx;
  margin-top: 10rpx;
}

.add-tag {
  font-size: 24rpx;
  color: #3B82F6;
}

.tags-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.tag-item {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  position: relative;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  
  &.active {
    border-color: #3B82F6;
    background: #EFF6FF;
  }
  
  .tag-icon {
    font-size: 40rpx;
    margin-bottom: 12rpx;
  }
  
  .tag-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1E293B;
    display: block;
  }
  
  .tag-count {
    font-size: 22rpx;
    color: #94A3B8;
    margin-top: 4rpx;
  }
  
  .check-circle {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 32rpx;
    height: 32rpx;
    background: #3B82F6;
    border-radius: 50%;
    color: white;
    font-size: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  // Tag Colors
  &.red .tag-icon { color: #EF4444; }
  &.blue .tag-icon { color: #3B82F6; }
  &.purple .tag-icon { color: #8B5CF6; }
  &.gray .tag-icon { color: #F59E0B; }
}

.priority-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.priority-btn {
  flex: 1;
  height: 80rpx;
  background: white;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #64748B;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  
  .dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
  }
  
  &.active {
    &.normal { background: #EFF6FF; border-color: #3B82F6; color: #3B82F6; }
    &.important { background: #FFFBEB; border-color: #F59E0B; color: #F59E0B; }
    &.urgent { background: #FEF2F2; border-color: #EF4444; color: #EF4444; }
  }
}

.date-options {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.date-opt {
  padding: 12rpx 24rpx;
  background: #F1F5F9;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #64748B;
  border: 2rpx solid transparent;
  
  &.active {
    background: #3B82F6;
    color: white;
  }
  
  &.custom {
    display: flex;
    align-items: center;
  }
}

.divider {
  height: 2rpx;
  background: #F1F5F9;
  margin: 20rpx 0;
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10rpx;
  
  .time-label {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 28rpx;
    color: #64748B;
    
    .icon { font-size: 32rpx; color: #94A3B8; }
  }
  
  .time-value {
    font-size: 30rpx;
    color: #1E293B;
    font-weight: 600;
    
    .arrow { color: #94A3B8; margin-left: 8rpx; }
  }
}

.subtask-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  
  .add-sub-btn {
    font-size: 24rpx;
    color: #3B82F6;
    background: #EFF6FF;
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
  }
}

.subtask-item {
  display: flex;
  align-items: center;
  background: #F8FAFC;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  
  .sub-icon {
    color: #CBD5E1;
    margin-right: 20rpx;
    font-weight: bold;
  }
  
  .sub-input {
    flex: 1;
    font-size: 28rpx;
    color: #334155;
  }
  
  .remove-sub {
    color: #94A3B8;
    padding: 10rpx;
  }
}

.empty-sub {
  text-align: center;
  font-size: 26rpx;
  color: #94A3B8;
  padding: 20rpx 0;
}
</style>