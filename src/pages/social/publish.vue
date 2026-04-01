<template>
  <view class="publish-page">
    <view class="composer">
      <text class="title">发布动态</text>
      <textarea v-model="content" class="textarea" placeholder="分享今日路况、照片或组队信息" maxlength="300" />
      <view class="toolbar">
        <text class="tool"><IconSvg name="camera" :size="24" color="#ff6b35" /> 图片</text>
        <text class="tool"><IconSvg name="location" :size="24" color="#ff6b35" /> 定位</text>
        <text class="tool"><IconSvg name="tag" :size="24" color="#ff6b35" /> 话题</text>
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
.publish-page { min-height: 100vh; background: #f2f2f7; padding: 24rpx; }
.composer { background: #fff; border-radius: 24rpx; padding: 28rpx; }
.title { display: block; font-size: 40rpx; font-weight: 700; color: #1a1a2e; margin-bottom: 20rpx; }
.textarea { width: 100%; min-height: 320rpx; background: #f7f8fa; border-radius: 18rpx; padding: 22rpx; box-sizing: border-box; font-size: 28rpx; }
.toolbar { display: flex; gap: 18rpx; margin: 20rpx 0 28rpx; color: #8e8e93; font-size: 25rpx; }
.tool { background: #fff1eb; color: #ff6b35; padding: 12rpx 18rpx; border-radius: 999rpx; }
.submit-btn { background: #ff6b35; color: #fff; border-radius: 20rpx; font-size: 30rpx; }
</style>
