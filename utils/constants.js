/**
 * 常量定义
 */

// 任务类型
export const TaskType = {
  TODO: 'todo',
  HABIT: 'habit'
}

// 优先级
export const Priority = {
  P1: { value: 1, label: 'P1', color: '#FF3B30' },
  P2: { value: 2, label: 'P2', color: '#FF9500' },
  P3: { value: 3, label: 'P3', color: '#8E8E93' }
}

// 标签颜色
export const TagColors = {
  '无标签': { bg: '#FFF8DC', text: '#333' },
  '人生思考': { bg: '#F0E6FF', text: '#333' },
  '工作': { bg: '#FFE6F0', text: '#333' },
  '生活': { bg: '#E6F2FF', text: '#333' },
  '学习': { bg: '#E6FFE6', text: '#333' }
}

// 习惯分类
export const HabitCategories = [
  { id: 'all', name: '全部', icon: 'apps' },
  { id: 'health', name: '健康', icon: 'heart' },
  { id: 'sport', name: '运动', icon: 'basketball' },
  { id: 'study', name: '学习', icon: 'book' },
  { id: 'life', name: '生活', icon: 'home' },
  { id: 'work', name: '工作', icon: 'briefcase' },
  { id: 'quit', name: '戒除', icon: 'close-circle', isBad: true }
]

// 频率类型
export const Frequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom'
}