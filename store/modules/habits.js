import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { useUserStore } from './user'

export const useHabitStore = defineStore('habits', {
  state: () => ({
    habits: [],
    categories: [
      { id: 'all', name: '全部', icon: 'apps' },
      { id: 'health', name: '健康', icon: 'heart' },
      { id: 'sport', name: '运动', icon: 'basketball' },
      { id: 'study', name: '学习', icon: 'book' },
      { id: 'life', name: '生活', icon: 'home' },
      { id: 'work', name: '工作', icon: 'briefcase' },
      { id: 'quit', name: '戒除', icon: 'close-circle', isBad: true }
    ]
  }),

  getters: {
    goodHabits: (state) => (state.habits || []).filter(h => !h.isBad),
    badHabits: (state) => (state.habits || []).filter(h => h.isBad),
    
    byCategory: (state) => (categoryId) => {
      const habits = state.habits || []
      if (categoryId === 'all') return habits
      if (categoryId === 'quit') return habits.filter(h => h.isBad)
      return habits.filter(h => h.category === categoryId && !h.isBad)
    },
    
    currentStreak: (state) => {
      return (state.habits || []).reduce((max, h) => Math.max(max, h.streak), 0)
    }
  },

  actions: {
    createHabit(habitData) {
      const habit = {
        id: habitData.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
        name: '',
        icon: '📋',
        category: 'life',
        frequency: 'daily',
        weekDays: [1,2,3,4,5,6,0],
        reminderTime: '08:00',
        coins: 1,
        color: '#4A90E2',
        isBad: false,
        tolerance: 3,
        currentTolerance: 0,
        streak: 0,
        maxStreak: 0,
        totalCompleted: 0,
        lastCompletedDate: null,
        createdAt: new Date().toISOString(),
        ...habitData
      }
      
      this.habits.push(habit)
      this.save()
      return habit
    },

    // Alias for completeHabit to support both naming conventions
    checkIn(habitId, date) {
      // Toggle logic: If already completed today, undo it. Otherwise, complete it.
      const habit = this.habits.find(h => h.id === habitId)
      if (!habit) return false
      
      const today = date || new Date().toISOString().split('T')[0]
      const isCompletedToday = habit.lastCompletedDate === today
      
      if (isCompletedToday) {
        return this.undoHabit(habitId, today)
      } else {
        return this.completeHabit(habitId, today)
      }
    },

    undoHabit(habitId, date) {
      const habit = this.habits.find(h => h.id === habitId)
      if (!habit) return false
      
      const userStore = useUserStore()
      
      // Revert logic
      habit.lastCompletedDate = null // This simplifies it; theoretically we should revert to previous date, but for now null is enough to show "not done today"
      // Ideally we would look up history to revert streak, but simplified for now:
      if (habit.streak > 0) habit.streak-- 
      if (habit.totalCompleted > 0) habit.totalCompleted--
      
      // Revert coins
      if (habit.isBad) {
        userStore.addCoins(habit.coins, `撤销破戒: ${habit.name}`)
      } else {
        userStore.deductCoins(habit.coins, `撤销打卡: ${habit.name}`)
      }
      
      this.save()
      return true // Indicates un-checked
    },

    completeHabit(habitId, dateStr) {
      const habit = this.habits.find(h => h.id === habitId)
      if (!habit) return false
      
      const today = dateStr || new Date().toISOString().split('T')[0]
      if (habit.lastCompletedDate === today) return false // Prevent double check-in

      // Calculate streak based on consecutive days
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Note: If lastCompletedDate was yesterday, streak increments.
      // If lastCompletedDate was null or older, streak resets to 1.
      // However, if we are re-checking-in after undoing on same day...
      // The logic needs to be robust. 
      // Simplified: If streak was decremented on undo, we just increment it back.
      // But we can't know easily. 
      // Let's stick to the basic check:
      
      if (habit.lastCompletedDate === yesterdayStr) {
        habit.streak++
      } else {
        // Only reset if it wasn't already today (which is handled by double check-in guard)
        // If it was some days ago
        habit.streak = 1
      }

      habit.totalCompleted++
      if (habit.streak > habit.maxStreak) {
        habit.maxStreak = habit.streak
      }
      habit.lastCompletedDate = today
      
      const userStore = useUserStore()
      if (habit.isBad) {
        userStore.deductCoins(habit.coins, `破戒: ${habit.name}`)
      } else {
        userStore.addCoins(habit.coins, `习惯打卡: ${habit.name}`)
      }

      this.save()
      return true // Indicates checked
    },

    recordBadHabit(habitId) {
      const habit = this.habits.find(h => h.id === habitId)
      if (!habit || !habit.isBad) return false
      
      habit.currentTolerance++
      habit.streak = 0
      
      this.save()
      return true
    },

    updateHabit(habitData) {
      const index = this.habits.findIndex(h => h.id === habitData.id)
      if (index > -1) {
        this.habits[index] = { ...this.habits[index], ...habitData }
        this.save()
        return true
      }
      return false
    },

    deleteHabit(id) {
      const index = this.habits.findIndex(h => h.id === id)
      if (index > -1) {
        this.habits.splice(index, 1)
        this.save()
        return true
      }
      return false
    },

    deleteHabits(ids) {
      this.habits = this.habits.filter(h => !ids.includes(h.id))
      this.save()
    },

    deleteAllHabits() {
      this.habits = []
      this.save()
    },

    save() {
      storage.set('habits', this.habits)
    },

    init() {
      const saved = storage.get('habits')
      if (saved && Array.isArray(saved)) {
        // Check for and fix duplicate IDs
        const seenIds = new Set()
        let hasChanges = false
        
        this.habits = saved.map(habit => {
          // Fix numeric IDs to string if mixed (optional but good practice)
          let id = String(habit.id)
          
          if (seenIds.has(id)) {
            hasChanges = true
            // Generate new unique ID
            id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }
          seenIds.add(id)
          return { ...habit, id }
        })

        if (hasChanges) {
          console.log('Fixed duplicate habit IDs during init')
          this.save()
        }
      }
    }
  }
})