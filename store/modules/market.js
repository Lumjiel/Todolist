import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarketStore = defineStore('market', () => {
  // 贫民窟 - 即时奖励
  const poorItems = ref([])
  
  // 星愿池 - 长期目标
  const wishItems = ref([])

  const addPoorItem = (item) => {
    poorItems.value.push({ id: Date.now(), ...item })
  }

  const addWishItem = (item) => {
    wishItems.value.push({ id: Date.now(), ...item })
  }

  const updateItem = (item, type) => {
    const list = type === 'poor' ? poorItems : wishItems
    const index = list.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      list.value[index] = { ...list.value[index], ...item }
    }
  }

  const removeItem = (id, type) => {
    if (type === 'poor') {
      poorItems.value = poorItems.value.filter(i => i.id !== id)
    } else {
      wishItems.value = wishItems.value.filter(i => i.id !== id)
    }
  }

  return {
    poorItems,
    wishItems,
    addPoorItem,
    addWishItem,
    updateItem,
    removeItem
  }
})