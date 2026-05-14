<template>
  <uni-popup ref="popupRef" type="bottom" @change="onPopupChange">
    <view class="modal-content" :class="{ 'wish-mode': type === 'wish' }">
      <view class="modal-header">
        <view class="header-left" @click="close">
          <text class="back-icon">✕</text>
        </view>
        <text class="modal-title">{{ isEdit ? '编辑' : '添加' }}{{ type === 'poor' ? '奖励' : '星愿' }}</text>
        <view class="header-right" @click="submit">
          <text class="save-text">保存</text>
        </view>
      </view>
      
      <scroll-view scroll-y class="form-scroll">
        <view class="form-item">
          <text class="label">名称</text>
          <input v-model="form.name" class="input" placeholder="例如：看电影" placeholder-style="color: #999" />
        </view>
        
        <view class="form-item">
          <text class="label">所需金币</text>
          <input 
            v-model.number="form.cost" 
            class="input" 
            type="number"
            placeholder="输入金币数量"
            placeholder-style="color: #999"
          />
        </view>
        
        <view class="form-item">
          <text class="label">图标</text>
          <view class="icon-grid">
            <view 
              v-for="icon in commonIcons" 
              :key="icon"
              class="icon-option"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">卡片背景</text>
          <view class="wallpaper-grid">
            <view 
              class="wallpaper-option none"
              :class="{ active: !form.wallpaper }"
              @click="form.wallpaper = ''"
            >
              纯色
            </view>
            <view 
              v-for="wp in presetWallpapers" 
              :key="wp"
              class="wallpaper-option"
              :class="{ active: form.wallpaper === wp }"
              :style="{ backgroundImage: `url(${wp})` }"
              @click="form.wallpaper = wp"
            ></view>
            <view class="wallpaper-option upload" @click="chooseImage">
              <text>+</text>
            </view>
          </view>
        </view>
        
        <view style="height: 40rpx;"></view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'poor'
  },
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const popupRef = ref(null)
const commonIcons = ['🎬', '🍔', '🎮', '📚', '✈️', '📱', '💻', '👟', '🎁', '☕', '💅', '💇‍♀️', '🧖‍♀️', '🎤', '🎢']
const presetWallpapers = [
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
]

const form = ref({
  name: '',
  cost: 20,
  icon: '🎬',
  wallpaper: ''
})

const isEdit = computed(() => !!props.editData)

// 监听 show 变化控制弹窗
watch(() => props.show, async (newVal) => {
  if (newVal) {
    if (props.editData) {
      form.value = { ...JSON.parse(JSON.stringify(props.editData)) }
    } else {
      // Reset defaults based on type
      form.value = {
        name: '',
        cost: props.type === 'poor' ? 20 : 1000,
        icon: '🎬',
        wallpaper: ''
      }
    }
    
    await nextTick()
    setTimeout(() => {
      popupRef.value?.open()
    }, 50)
  } else {
    popupRef.value?.close()
  }
})

const onPopupChange = (e) => {
  if (!e.show) {
    emit('update:show', false)
  }
}

const close = () => {
  popupRef.value?.close()
  emit('update:show', false)
}

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      form.value.wallpaper = res.tempFilePaths[0]
    }
  })
}

const submit = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  
  emit('confirm', { ...form.value, id: props.editData?.id })
  close()
}

defineExpose({
  open: () => popupRef.value?.open(),
  close: () => popupRef.value?.close()
})
</script>

<style lang="scss" scoped>
.modal-content {
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  height: 85vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  &.wish-mode {
    background: #1c1c2e;
    
    .modal-title { color: #fff; }
    .back-icon { color: rgba(255,255,255,0.6); }
    .save-text { color: #667eea; }
    .label { color: rgba(255,255,255,0.6); }
    .input { 
      background: rgba(255,255,255,0.05); 
      color: #fff;
    }
    .icon-option { 
      background: rgba(255,255,255,0.05);
      
      &.active {
        background: rgba(100, 100, 255, 0.2);
        border-color: #667eea;
      }
    }
    .wallpaper-option.none {
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.6);
      
      &.active {
        border-color: #667eea;
      }
    }
    .wallpaper-option.upload {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.2);
    }
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 32rpx;
  // border-bottom: 1rpx solid rgba(0,0,0,0.05);
  
  .wish-mode & {
    border-bottom-color: rgba(255,255,255,0.05);
  }
}

.header-left, .header-right {
  padding: 10rpx;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.save-text {
  font-size: 30rpx;
  color: #007AFF;
  font-weight: 600;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
}

.form-scroll {
  flex: 1;
  padding: 32rpx;
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 36rpx;
}

.label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.input {
  height: 96rpx;
  background: #f5f5f7;
  border-radius: 24rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  color: #333;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24rpx;
}

.icon-option {
  aspect-ratio: 1;
  background: #f5f5f7;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  border: 4rpx solid transparent;
  transition: all 0.2s;
  
  &.active {
    border-color: #007AFF;
    background: #e3f2fd;
    transform: scale(1.05);
  }
}

.wallpaper-grid {
  display: flex;
  gap: 24rpx;
  flex-wrap: wrap;
}

.wallpaper-option {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  background-size: cover;
  background-position: center;
  border: 4rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &.active {
    border-color: #007AFF;
    transform: scale(1.05);
  }
  
  &.none {
    background: #f5f5f7;
    font-size: 26rpx;
    color: #666;
    font-weight: 500;
  }
  
  &.upload {
    background: #f5f5f7;
    border: 2rpx dashed #ddd;
    font-size: 56rpx;
    color: #999;
  }
}
</style>
