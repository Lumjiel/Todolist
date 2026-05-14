import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useUserStore } from './user'

export const useTaskStore = defineStore('tasks', () => {
  const defaultTasks = []

  // Load from local storage or use default
  const savedTasks = uni.getStorageSync('life_game_tasks')
  let loadedTasks = savedTasks ? JSON.parse(savedTasks) : defaultTasks

  // Deduplication Logic: Check for and fix duplicate IDs
  const seenIds = new Set()
  let hasChanges = false
  loadedTasks = loadedTasks.map(task => {
    let id = task.id
    if (seenIds.has(id)) {
      hasChanges = true
      // Generate robust unique ID
      id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    seenIds.add(id)
    return { ...task, id }
  })

  const tasks = ref(loadedTasks)

  if (hasChanges) {
    uni.setStorageSync('life_game_tasks', JSON.stringify(loadedTasks))
    console.log('Fixed duplicate task IDs during init')
  }

  // Watch for changes and save to local storage
  watch(tasks, (newTasks) => {
    uni.setStorageSync('life_game_tasks', JSON.stringify(newTasks))
  }, { deep: true })

  const addTask = (task) => {
    tasks.value.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...task,
      status: 'pending'
    })
  }

  const toggleTask = (id) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      const isCompleting = task.status !== 'completed'
      task.status = isCompleting ? 'completed' : 'pending'
      
      const userStore = useUserStore()
      if (isCompleting) {
        userStore.addCoins(task.coins, `完成任务: ${task.title}`)
      } else {
        // Optional: Deduct coins if un-checking? 
        // Usually better to not deduct if they made a mistake, 
        // but for strictness we might. Let's assume strict for now or just leave it.
        // If we want to prevent abuse (spamming check/uncheck), we should deduct.
        userStore.deductCoins(task.coins, `取消任务: ${task.title}`)
      }
    }
  }

  const updateTask = (updatedTask) => {
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index > -1) {
      tasks.value[index] = { ...tasks.value[index], ...updatedTask }
    }
  }

  const deleteTask = (id) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index > -1) tasks.value.splice(index, 1)
  }

  const deleteTasks = (ids) => {
    tasks.value = tasks.value.filter(t => !ids.includes(t.id))
  }

  const deleteAllTasks = () => {
    // Keep habits, only delete todos? The user said "clear all todos" (待办事项).
    // The store contains both todos and habits in the same array 'tasks'.
    // We should only delete items where type === 'todo'.
    tasks.value = tasks.value.filter(t => t.type !== 'todo')
  }

  const getTasksByDate = (date) => {
    return tasks.value.filter(t => t.date === date)
  }

  const loadTasks = () => {
    const stored = uni.getStorageSync('life_game_tasks')
    if (stored) {
      tasks.value = JSON.parse(stored)
    }
  }

  return {
    tasks,
    loadTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    deleteTasks,
    deleteAllTasks,
    getTasksByDate
  }
})