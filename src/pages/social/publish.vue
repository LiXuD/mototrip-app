<template>
  <view class="publish-page">
    <view class="composer">
      <text class="title">发布动态</text>
      <textarea v-model="content" class="textarea" placeholder="分享今日路况、照片或组队信息" maxlength="300" />
      <view class="toolbar">
        <text class="tool">📷 图片</text>
        <text class="tool">📍 定位</text>
        <text class="tool">🏷️ 话题</text>
      </view>
      <button class="submit-btn" :loading="submitting" @click="submit">发布</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { postApi } from '@/services/api'

const content = ref('')
const submitting = ref(false)

async function submit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await postApi.create({ content: content.value.trim(), images: [] })
    uni.showToast({ title: '动态已发布', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 300)
  } catch (error) {
    console.error('发布动态失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.publish-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}

.composer {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 28rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 2rpx;
  margin-bottom: 20rpx;
}

.textarea {
  width: 100%;
  min-height: 320rpx;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  border-radius: 18rpx;
  padding: 22rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;

  &::placeholder {
    color: #555577;
  }

  &:focus {
    border-color: #00D4FF;
    box-shadow: 0 0 16rpx rgba(0, 212, 255, 0.3);
  }
}

.toolbar {
  display: flex;
  gap: 18rpx;
  margin: 20rpx 0 28rpx;
  color: #8888AA;
  font-size: 25rpx;
}

.tool {
  background: rgba(255, 107, 53, 0.12);
  color: #FF6B35;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 107, 53, 0.3);
  box-shadow: 0 0 12rpx rgba(255, 107, 53, 0.2);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }
}

.submit-btn {
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }

  &::after {
    display: none;
  }
}
</style>
