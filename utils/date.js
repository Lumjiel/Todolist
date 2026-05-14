/**
 * 日期处理工具
 */

/**
 * 格式化日期
 * @param {Date|string} date 日期
 * @param {string} format 格式
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
}

/**
 * 获取星期文本
 * @param {Date} date 日期
 */
export function getWeekText(date) {
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weeks[date.getDay()]
}

/**
 * 获取星期简写
 * @param {Date} date 日期
 */
export function getWeekShort(date) {
  const weeks = ['日', '一', '二', '三', '四', '五', '六']
  return weeks[date.getDay()]
}

/**
 * 获取今天日期字符串
 */
export function getToday() {
  return formatDate(new Date())
}

/**
 * 判断是否同一天
 * @param {Date|string} date1 日期1
 * @param {Date|string} date2 日期2
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return d1.toDateString() === d2.toDateString()
}

/**
 * 获取一周日期
 * @param {Date} date 基准日期
 */
export function getWeekDays(date = new Date()) {
  const current = new Date(date)
  const day = current.getDay()
  const diff = current.getDate() - day
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(current.setDate(diff + i))
    days.push({
      date: d.getDate(),
      fullDate: formatDate(d),
      dayName: getWeekShort(d),
      isToday: isSameDay(d, new Date())
    })
    current.setDate(diff + i) // 重置
  }
  return days
}