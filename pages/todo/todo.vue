<template>
  <view class="page-container" :class="{ 'dark-mode': userStore.settings.darkMode }">
    <!-- 状态栏 -->
    <view class="status-bar"></view>
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="toggleArchiveView">
        <text class="archive-icon" v-if="!isArchiveView">🗄️</text>
        <text class="back-icon" v-else>←</text>
      </view>
      <view class="nav-center" @click="!isArchiveView ? toggleFilter() : null">
        <template v-if="!isArchiveView">
          <text class="title">{{ currentFilter || '全部' }}</text>
          <text class="arrow" :class="{ rotate: showCategoryMenu }">⌄</text>
        </template>
        <template v-else>
          <text class="title">归档查看</text>
        </template>
      </view>
      <view class="nav-right" @click="!isArchiveView ? toggleMoreMenu() : null">
        <text class="more" v-if="!isArchiveView">⋯</text>
      </view>
    </view>

    <!-- 下拉菜单遮罩 -->
    <view class="dropdown-mask" v-if="showCategoryMenu || showMoreMenu" @click="closeMenus"></view>
    
    <!-- 分类筛选菜单 -->
    <view class="dropdown-menu" v-if="showCategoryMenu">
      <view 
        class="dropdown-item" 
        :class="{ active: currentFilter === '全部' }"
        @click="selectCategory('全部')"
      >
        <text>全部</text>
        <text v-if="currentFilter === '全部'" class="check">✓</text>
      </view>
      <view 
        v-for="cat in categories" 
        :key="cat.name"
        class="dropdown-item"
        :class="{ active: currentFilter === cat.name }"
        @click="selectCategory(cat.name)"
      >
        <text>{{ cat.name }}</text>
        <text v-if="currentFilter === cat.name" class="check">✓</text>
      </view>
    </view>

    <!-- 更多操作菜单 -->
    <view class="dropdown-menu more-menu" v-if="showMoreMenu">
      <view class="dropdown-item" @click="enterDeleteMode">
        <text>勾选删除</text>
      </view>
      <view class="dropdown-item" @click="confirmDeleteAll">
        <text>全部删除</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view scroll-y class="board-scroll">
      
      <!-- 1. 看板网格 (瀑布流布局) -->
      <view class="waterfall-container" v-if="!isArchiveView">
        <!-- 左列 -->
        <view class="waterfall-column">
          <view 
            v-for="column in leftColumns" 
            :key="column.name"
            class="board-card"
            :class="column.colorClass"
          >
            <!-- Card Content Reuse -->
            <view class="card-header">
              <text class="card-title">{{ column.name }}</text>
              <view class="progress-wrap">
                <text class="progress-text">{{ column.completedCount }}/{{ column.totalCount }}</text>
                <view class="progress-ring">
                  <view class="ring-bg"></view>
                  <view class="ring-progress full" v-if="column.progress === 1"></view>
                  <view class="ring-progress" v-else :style="{ opacity: column.progress > 0 ? 1 : 0 }"></view>
                </view>
              </view>
            </view>
            
            <view class="card-tasks">
              <view 
                v-for="task in column.tasks" 
                :key="task.id"
                class="mini-task"
                @click="handleTaskClick(task)"
              >
                <view class="priority-badge" :class="`p${task.priority || 3}`">
                  {{ task.priority === 1 ? '!' : (task.priority === 2 ? '!' : '3') }}
                </view>

                <view class="task-info">
                  <text class="task-name" :class="{ completed: !isDeleteMode && task.status === 'completed' }">{{ task.title }}</text>
                  <view class="task-meta" v-if="task.date">
                     <text class="task-date">{{ task.date }}</text>
                  </view>
                </view>
                
                <view 
                  class="check-circle" 
                  :class="{ 
                    checked: isDeleteMode ? selectedTaskIds.includes(task.id) : task.status === 'completed',
                    'delete-mode': isDeleteMode
                  }" 
                  @click.stop="handleTaskCheck(task)"
                >
                   <text v-if="(!isDeleteMode && task.status === 'completed') || (isDeleteMode && selectedTaskIds.includes(task.id))" class="check-icon">✓</text>
                </view>
              </view>
              
              <view v-if="column.tasks.length === 0" class="empty-tip">
                暂无任务
              </view>
            </view>
          </view>
        </view>

        <!-- 右列 -->
        <view class="waterfall-column">
          <view 
            v-for="column in rightColumns" 
            :key="column.name"
            class="board-card"
            :class="column.colorClass"
          >
            <!-- Reuse Card Content -->
            <view class="card-header">
              <text class="card-title">{{ column.name }}</text>
              <view class="progress-wrap">
                <text class="progress-text">{{ column.completedCount }}/{{ column.totalCount }}</text>
                <view class="progress-ring">
                  <view class="ring-bg"></view>
                  <view class="ring-progress full" v-if="column.progress === 1"></view>
                  <view class="ring-progress" v-else :style="{ opacity: column.progress > 0 ? 1 : 0 }"></view>
                </view>
              </view>
            </view>
            
            <view class="card-tasks">
              <view 
                v-for="task in column.tasks" 
                :key="task.id"
                class="mini-task"
                @click="handleTaskClick(task)"
              >
                <view class="priority-badge" :class="`p${task.priority || 3}`">
                  {{ task.priority === 1 ? '!' : (task.priority === 2 ? '!' : '3') }}
                </view>

                <view class="task-info">
                  <text class="task-name" :class="{ completed: !isDeleteMode && task.status === 'completed' }">{{ task.title }}</text>
                  <view class="task-meta" v-if="task.date">
                     <text class="task-date">{{ task.date }}</text>
                  </view>
                </view>
                
                <view 
                  class="check-circle" 
                  :class="{ 
                    checked: isDeleteMode ? selectedTaskIds.includes(task.id) : task.status === 'completed',
                    'delete-mode': isDeleteMode
                  }" 
                  @click.stop="handleTaskCheck(task)"
                >
                   <text v-if="(!isDeleteMode && task.status === 'completed') || (isDeleteMode && selectedTaskIds.includes(task.id))" class="check-icon">✓</text>
                </view>
              </view>
              
              <view v-if="column.tasks.length === 0" class="empty-tip">
                暂无任务
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 归档列表 (纵向单列) -->
      <view class="board-list" v-if="isArchiveView">
        <view 
          v-for="column in boardColumns" 
          :key="column.name"
          class="board-card vertical"
          :class="column.colorClass"
        >
          <view class="card-header">
            <text class="card-title">{{ column.name }}</text>
            <view class="progress-wrap">
              <text class="progress-text">{{ column.completedCount }}/{{ column.totalCount }}</text>
              <view class="progress-ring">
                <view class="ring-bg"></view>
                <view class="ring-progress full" v-if="column.progress === 1"></view>
                <view class="ring-progress" v-else :style="{ opacity: column.progress > 0 ? 1 : 0 }"></view>
              </view>
            </view>
          </view>
          
          <view class="card-tasks">
            <view 
              v-for="task in column.tasks" 
              :key="task.id"
              class="mini-task"
              @click="handleTaskClick(task)"
            >
              <view class="priority-badge" :class="`p${task.priority || 3}`">
                {{ task.priority === 1 ? '!' : (task.priority === 2 ? '!' : '3') }}
              </view>

              <view class="task-info">
                <text class="task-name" :class="{ completed: !isDeleteMode && task.status === 'completed' }">{{ task.title }}</text>
                <view class="task-meta" v-if="task.date">
                   <text class="task-date">{{ task.date }}</text>
                </view>
              </view>
              
              <view 
                class="check-circle" 
                :class="{ 
                  checked: isDeleteMode ? selectedTaskIds.includes(task.id) : task.status === 'completed',
                  'delete-mode': isDeleteMode
                }" 
                @click.stop="handleTaskCheck(task)"
              >
                 <text v-if="(!isDeleteMode && task.status === 'completed') || (isDeleteMode && selectedTaskIds.includes(task.id))" class="check-icon">✓</text>
              </view>
            </view>
            
            <view v-if="column.tasks.length === 0" class="empty-tip">
              暂无任务
            </view>
          </view>
        </view>
      </view>
      
      <view style="height: 150px;"></view>
    </scroll-view>

    <!-- 添加按钮 (Draggable FAB) -->
    <view 
      class="fab" 
      v-if="!isDeleteMode"
      :style="{ left: fabPos.x + 'px', top: fabPos.y + 'px' }"
      @touchstart.stop.prevent="onFabTouchStart"
      @touchmove.stop.prevent="onFabTouchMove"
      @touchend.stop.prevent="onFabTouchEnd"
      @click.stop="onFabClick"
    >
      <text class="fab-icon">+</text>
    </view>
    
    <add-task-modal
      :show="showAddModal"
      :edit-data="editingTask"
      @update:show="showAddModal = $event"
      @confirm="handleTaskConfirm"
    />

    <!-- 底部操作栏 (删除模式) -->
    <view class="delete-bar" v-if="isDeleteMode">
      <view class="delete-btn cancel" @click="cancelDeleteMode">取消</view>
      <view class="delete-btn confirm" :class="{ disabled: selectedTaskIds.length === 0 }" @click="executeBatchDelete">删除 ({{ selectedTaskIds.length }})</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/store/modules/tasks'
import { useUserStore } from '@/store/modules/user'
import AddTaskModal from '@/components/add-task-modal/add-task-modal.vue'

const taskStore = useTaskStore()
const userStore = useUserStore()
const showAddModal = ref(false)
const editingTask = ref(null)

// Filter State
const currentFilter = ref('全部')
const showCategoryMenu = ref(false)
const showMoreMenu = ref(false)

// Delete Mode State
const isDeleteMode = ref(false)
const selectedTaskIds = ref([])
const isArchiveView = ref(false)

// FAB State
const fabPos = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const isClick = ref(true)
let sysInfo = null
let fabSize = 50

onMounted(() => {
  try {
    sysInfo = uni.getSystemInfoSync()
    fabSize = uni.upx2px(100) // 100rpx
    // 初始位置：右下角，完全可见，留出安全距离
    fabPos.value = { 
      x: sysInfo.windowWidth - fabSize - 20, 
      y: sysInfo.windowHeight - 150 
    }
  } catch (e) {
    console.error('FAB init failed:', e)
    fabPos.value = { x: 300, y: 600 } // Fallback
  }
})

// FAB Touch Logic
const onFabTouchStart = (e) => {
  if (!sysInfo) return
  isDragging.value = true
  isClick.value = true // Reset click flag
  const touch = e.touches[0]
  dragOffset.value = {
    x: touch.clientX - fabPos.value.x,
    y: touch.clientY - fabPos.value.y
  }
}

const onFabTouchMove = (e) => {
  if (!isDragging.value) return
  isClick.value = false // It's a drag, not a click
  
  const touch = e.touches[0]
  let x = touch.clientX - dragOffset.value.x
  let y = touch.clientY - dragOffset.value.y
  
  // Boundary Check
  if (x < 0) x = 0
  if (x > sysInfo.windowWidth - fabSize) x = sysInfo.windowWidth - fabSize
  if (y < 0) y = 0
  if (y > sysInfo.windowHeight - fabSize) y = sysInfo.windowHeight - fabSize
  
  fabPos.value = { x, y }
}

const onFabTouchEnd = () => {
  isDragging.value = false
  
  if (isClick.value) {
    onFabClick()
    return
  }
  
  // Auto dock to side (Half Hidden)
  const midX = sysInfo.windowWidth / 2
  if (fabPos.value.x + fabSize / 2 > midX) {
    // Dock Right
    fabPos.value.x = sysInfo.windowWidth - (fabSize / 2)
  } else {
    // Dock Left
    fabPos.value.x = -(fabSize / 2)
  }
}

const onFabClick = () => {
  // Only trigger if it wasn't a drag
  addTask()
}

// Filter Logic
const toggleFilter = () => {
  showCategoryMenu.value = !showCategoryMenu.value
  showMoreMenu.value = false
}

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
  showCategoryMenu.value = false
}

const closeMenus = () => {
  showCategoryMenu.value = false
  showMoreMenu.value = false
}

const selectCategory = (cat) => {
  currentFilter.value = cat
  closeMenus()
}

// Delete Logic
const enterDeleteMode = () => {
  isDeleteMode.value = true
  closeMenus()
  selectedTaskIds.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedTaskIds.value = []
}

const confirmDeleteAll = () => {
  closeMenus()
  uni.showModal({
    title: '确认全部删除',
    content: '确定要清空所有待办事项吗？此操作不可恢复。',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) {
        taskStore.deleteAllTasks()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

const executeBatchDelete = () => {
  if (selectedTaskIds.value.length === 0) return
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedTaskIds.value.length} 项任务吗？`,
    success: (res) => {
      if (res.confirm) {
        taskStore.deleteTasks(selectedTaskIds.value)
        cancelDeleteMode()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const handleTaskClick = (task) => {
  if (isDeleteMode.value) {
    handleTaskCheck(task)
  } else {
    editTask(task)
  }
}

const handleTaskCheck = (task) => {
  if (isDeleteMode.value) {
    const index = selectedTaskIds.value.indexOf(task.id)
    if (index > -1) {
      selectedTaskIds.value.splice(index, 1)
    } else {
      selectedTaskIds.value.push(task.id)
    }
  } else {
    toggleTask(task)
  }
}

// Board Logic
const categories = [
  { name: '无标签', colorClass: 'yellow' },
  { name: '人生思考', colorClass: 'purple' },
  { name: '生活', colorClass: 'blue' },
  { name: '工作', colorClass: 'pink' }
]

const boardColumns = computed(() => {
  const tasks = taskStore.tasks.filter(t => t.type === 'todo')
  let filteredCats = categories
  
  if (currentFilter.value !== '全部') {
    filteredCats = categories.filter(c => c.name === currentFilter.value)
  }
  
  return filteredCats.map(cat => {
    const catTasks = tasks.filter(t => (t.category || '无标签') === cat.name)
    const total = catTasks.length
    const completed = catTasks.filter(t => t.status === 'completed').length
    const progress = total > 0 ? completed / total : 0
    
    return {
      name: cat.name,
      colorClass: cat.colorClass,
      tasks: catTasks,
      totalCount: total,
      completedCount: completed,
      progress
    }
  })
})

const leftColumns = computed(() => boardColumns.value.filter((_, index) => index % 2 === 0))
const rightColumns = computed(() => boardColumns.value.filter((_, index) => index % 2 !== 0))

const addTask = () => {
  editingTask.value = null
  showAddModal.value = true
}

const editTask = (task) => {
  editingTask.value = task
  showAddModal.value = true
}

const toggleTask = (task) => taskStore.toggleTask(task.id)

const handleTaskConfirm = (taskData) => {
  if (taskData.id) {
    taskStore.updateTask(taskData)
  } else {
    taskStore.addTask({
      type: 'todo',
      category: '无标签',
      ...taskData
    })
  }
  uni.showToast({ title: '保存成功', icon: 'success' })
}

const toggleArchiveView = () => {
  isArchiveView.value = !isArchiveView.value
  // Reset other states if needed
  if (isArchiveView.value) {
    showCategoryMenu.value = false
    showMoreMenu.value = false
    isDeleteMode.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 120rpx;
  padding-top: var(--status-bar-height);
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  /* z-index removed to allow modal to cover it */
}

.nav-left, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.archive-icon { font-size: 36rpx; }
.back-icon { font-size: 40rpx; color: var(--text-primary); }
.more { font-size: 40rpx; color: var(--text-secondary); }

.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
}

.arrow {
  font-size: 32rpx;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
  &.rotate { transform: rotate(180deg); }
}

/* Dropdown Menu */
.dropdown-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 900;
  background: transparent; /* Clickable mask */
}

.dropdown-menu {
  position: absolute;
  top: calc(var(--status-bar-height) + 88rpx);
  left: 50%;
  transform: translateX(-50%);
  width: 280rpx;
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
    color: #007AFF;
    font-weight: 500;
  }
  
  .check {
    color: #007AFF;
    font-size: 28rpx;
  }
  
  &:active {
    background: var(--icon-bg-default);
  }
}

.board-scroll {
  padding: 0 30rpx;
  height: calc(100vh - 200rpx);
}

.waterfall-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  min-width: 0;
}

.board-card {
  border-radius: 32rpx;
  padding: 30rpx;
  transition: background-color 0.3s;
  
  &.yellow { background: #FFF8DC; }
  &.purple { background: #F0E6FF; }
  &.blue { background: #E6F2FF; }
  &.pink { background: #FFE6F0; }
}

/* Dark Mode Overrides for Cards */
.dark-mode {
  .board-card {
    &.yellow { background: #3D3D29; }
    &.purple { background: #2D263D; }
    &.blue { background: #1C2E4A; }
    &.pink { background: #3D2626; }
  }
  
  .card-title { color: #FFFFFF; }
  .task-name { color: #FFFFFF; }
  .progress-text { color: #AAAAAA; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-text {
  font-size: 26rpx;
  color: #666;
}

.progress-ring {
  position: relative;
  width: 44rpx;
  height: 44rpx;
}

.ring-bg {
  position: absolute;
  inset: 0;
  border: 4rpx solid var(--border-color);
  border-radius: 50%;
}

.ring-progress {
  position: absolute;
  inset: 0;
  border: 4rpx solid #007AFF;
  border-radius: 50%;
  border-left-color: transparent;
  border-bottom-color: transparent;
  transform: rotate(-45deg);

  &.full {
    border: 4rpx solid #007AFF;
    background: #007AFF;
  }
}

.card-tasks {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.mini-task {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  position: relative;
}

.priority-badge {
  min-width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: bold;
  flex-shrink: 0;
  
  &.p1 { border: 3rpx solid #FF3B30; color: #FF3B30; }
  &.p2 { border: 3rpx solid #FF9500; color: #FF9500; }
  &.p3 { border: 3rpx solid #8E8E93; color: #8E8E93; }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  display: block;
  
  &.completed {
    color: var(--text-secondary);
    text-decoration: line-through;
  }
}

.task-date {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-top: 6rpx;
  display: block;
}

.check-circle {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #C7C7CC;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.checked {
    background: #34C759;
    border-color: #34C759;
  }
}

.check-icon {
  font-size: 24rpx;
  color: #fff;
}

.empty-tip {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  padding: 20rpx;
}

.fab {
  position: fixed;
  width: 100rpx;
  height: 100rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8rpx 32rpx rgba(0,122,255,0.4);
  z-index: 999;
  transition: transform 0.1s linear; /* Smooth drag */
}

.fab-icon {
  font-size: 60rpx;
  font-weight: 300;
  margin-top: -6rpx;
}

.more-menu {
  left: auto;
  right: 30rpx;
  transform: none;
  width: 240rpx;
}

.check-circle.delete-mode {
  border-radius: 8rpx;
}

.delete-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120rpx;
  background: #fff;
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
  color: #666;
  background: #F2F2F7;
}

.delete-btn.confirm {
  color: #fff;
  background: #FF3B30;
}

.delete-btn.confirm.disabled {
  background: #FFD1D1;
  color: rgba(255,255,255,0.8);
}

/* Vertical List Layout (Archive View) */
.board-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 0 30rpx;
}

.board-card.vertical {
  width: 100%;
  box-sizing: border-box;
  min-height: 200rpx;
}
</style>