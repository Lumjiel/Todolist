import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const coins = ref(0)
  const streak = ref(0)
  const coinHistory = ref([])
  
  const userInfo = ref({
    nickname: '时间管理大师',
    avatar: '',
    id: '8848_9527'
  })

  const settings = ref({
    darkMode: false,
    notification: false,
    haptic: false
  })
  
  // Actions
  const addCoins = (amount, reason = '完成任务') => {
    coins.value += amount
    addToHistory(amount, 'earn', reason)
    saveToStorage()
  }
  
  const deductCoins = (amount, reason = '兑换奖励') => {
    if (coins.value >= amount) {
      coins.value -= amount
      addToHistory(amount, 'spend', reason)
      saveToStorage()
      return true
    }
    return false
  }

  const addToHistory = (amount, type, reason) => {
    coinHistory.value.unshift({
      id: Date.now(),
      amount,
      type,
      reason,
      time: new Date().toLocaleString()
    })
    // Keep last 100 records
    if (coinHistory.value.length > 100) {
      coinHistory.value.pop()
    }
  }
  
  const saveToStorage = () => {
    uni.setStorageSync('user_coins', coins.value)
    uni.setStorageSync('user_streak', streak.value)
    uni.setStorageSync('user_coin_history', JSON.stringify(coinHistory.value))
    uni.setStorageSync('user_info', JSON.stringify(userInfo.value))
    uni.setStorageSync('user_settings', JSON.stringify(settings.value))
  }
  
  const loadFromStorage = () => {
    const saved = uni.getStorageSync('user_coins')
    if (saved) coins.value = parseInt(saved)

    const savedStreak = uni.getStorageSync('user_streak')
    if (savedStreak) streak.value = parseInt(savedStreak)
    
    const savedHistory = uni.getStorageSync('user_coin_history')
    if (savedHistory) {
      try {
        coinHistory.value = JSON.parse(savedHistory)
      } catch (e) {
        coinHistory.value = []
      }
    }

    const savedInfo = uni.getStorageSync('user_info')
    if (savedInfo) {
      try {
        userInfo.value = JSON.parse(savedInfo)
      } catch (e) {}
    }

    const savedSettings = uni.getStorageSync('user_settings')
    if (savedSettings) {
      try {
        settings.value = JSON.parse(savedSettings)
      } catch (e) {}
    }
    
    // Apply theme after loading settings
    applyTheme()
  }

  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
    saveToStorage()
  }

  const toggleSetting = (key) => {
    settings.value[key] = !settings.value[key]
    saveToStorage()
    
    if (key === 'darkMode') {
      applyTheme()
    }
    
    // Haptic Feedback Logic
    if (key === 'haptic' && settings.value.haptic) {
      uni.vibrateShort()
    }
  }

  const applyTheme = () => {
    const isDark = settings.value.darkMode
    if (isDark) {
      uni.setTabBarStyle({
        backgroundColor: '#1E1E1E',
        color: '#8E8E93',
        selectedColor: '#0A84FF',
        borderStyle: 'black'
      })
      uni.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#121212'
      })
      uni.setBackgroundColor({
        backgroundColor: '#121212',
        backgroundColorTop: '#121212',
        backgroundColorBottom: '#121212'
      })
    } else {
      uni.setTabBarStyle({
        backgroundColor: '#FFFFFF',
        color: '#999999',
        selectedColor: '#4A90E2',
        borderStyle: 'white'
      })
      uni.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F5F6FA'
      })
      uni.setBackgroundColor({
        backgroundColor: '#F2F2F7',
        backgroundColorTop: '#F5F6FA',
        backgroundColorBottom: '#F2F2F7'
      })
    }
  }

  const triggerHaptic = () => {
    if (settings.value.haptic) {
      uni.vibrateShort()
    }
  }
  
  return {
    coins,
    streak,
    coinHistory,
    userInfo,
    settings,
    addCoins,
    deductCoins,
    loadFromStorage,
    updateUserInfo,
    toggleSetting,
    triggerHaptic
  }
})