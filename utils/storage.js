/**
 * 本地存储封装
 */
const storage = {
  /**
   * 设置缓存
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  },

  /**
   * 获取缓存
   * @param {string} key 键
   * @param {any} defaultValue 默认值
   */
  get(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue
    }
  },

  /**
   * 移除缓存
   * @param {string} key 键
   */
  remove(key) {
    try {
      uni.removeStorageSync(key)
      return true
    } catch (e) {
      return false
    }
  },

  /**
   * 清空缓存
   */
  clear() {
    try {
      uni.clearStorageSync()
      return true
    } catch (e) {
      return false
    }
  }
}

export { storage }