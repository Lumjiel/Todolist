<template>
  <view class="container" :class="{ 'dark-mode': userStore.settings.darkMode }">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">个人信息</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
      <!-- Avatar Section -->
      <view class="avatar-section" @click="changeAvatar">
        <view class="avatar-wrapper">
          <image 
            class="avatar" 
            :src="form.avatar || '/static/default-avatar.png'" 
            mode="aspectFill"
          />
          <view class="camera-icon">
            <text class="iconfont icon-camera"></text>
          </view>
        </view>
        <text class="tip">点击更换头像</text>
      </view>

      <!-- Form Section -->
      <view class="form-group">
        <view class="form-item">
          <text class="label">昵称</text>
          <input 
            class="input" 
            v-model="form.nickname" 
            placeholder="请输入昵称" 
            maxlength="12"
          />
        </view>
        <view class="form-item disabled">
          <text class="label">用户ID</text>
          <text class="value">{{ form.id }}</text>
          <text class="lock-icon iconfont icon-lock"></text>
        </view>
      </view>

      <button class="save-btn" @click="handleSave">保存修改</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const form = ref({
  nickname: '',
  avatar: '',
  id: ''
})

onMounted(() => {
  // Initialize form with store data
  form.value = { ...userStore.userInfo }
})

const goBack = () => {
  uni.navigateBack()
}

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // In a real app, upload this file to server.
      // Here we save it locally to ensure it persists a bit longer
      uni.saveFile({
        tempFilePath: tempFilePath,
        success: (saveRes) => {
          form.value.avatar = saveRes.savedFilePath
        }
      })
    }
  })
}

const handleSave = () => {
  if (!form.value.nickname.trim()) {
    uni.showToast({
      title: '昵称不能为空',
      icon: 'none'
    })
    return
  }

  userStore.updateUserInfo({
    nickname: form.value.nickname,
    avatar: form.value.avatar
  })

  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-top: var(--status-bar-height);
  transition: background-color 0.3s;
}

.header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background-color: var(--card-bg);
  transition: background-color 0.3s;
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: var(--text-primary);
  }
  
  .title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .placeholder {
    width: 60rpx;
  }
}

.content {
  padding: 40rpx 32rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .avatar-wrapper {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: var(--icon-bg-default);
    }
    
    .camera-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 48rpx;
      height: 48rpx;
      background-color: #007AFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4rpx solid var(--card-bg);
      transition: border-color 0.3s;
      
      .iconfont {
        color: #fff;
        font-size: 28rpx;
      }
    }
  }
  
  .tip {
    font-size: 26rpx;
    color: var(--text-secondary);
  }
}

.form-group {
  background-color: var(--card-bg);
  border-radius: 24rpx;
  padding: 0 32rpx;
  margin-bottom: 60rpx;
  transition: background-color 0.3s;
  
  .form-item {
    height: 110rpx;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid var(--border-color);
    transition: border-color 0.3s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.disabled {
      opacity: 0.7;
    }
    
    .label {
      width: 160rpx;
      font-size: 30rpx;
      color: var(--text-primary);
    }
    
    .input {
      flex: 1;
      font-size: 30rpx;
      color: var(--text-primary);
      text-align: right;
    }
    
    .value {
      flex: 1;
      font-size: 30rpx;
      color: var(--text-secondary);
      text-align: right;
    }
    
    .lock-icon {
      margin-left: 12rpx;
      font-size: 28rpx;
      color: var(--text-secondary);
    }
  }
}

.save-btn {
  background-color: #007AFF;
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  height: 96rpx;
  line-height: 96rpx;
  border: none;
  
  &:active {
    opacity: 0.9;
  }
}
</style>