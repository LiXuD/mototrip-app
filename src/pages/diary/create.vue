<template>
  <scroll-view class="form-page" scroll-y>
    <view class="form-card">
      <text class="page-title">写日记</text>
      <text class="page-subtitle">记录路况、心情和照片，把每次出发都沉淀下来。</text>
      <view class="field"><text class="label">标题</text><input v-model="form.title" class="input" placeholder="今天发生了什么值得记录？" /></view>
      <view class="field"><text class="label">内容</text><textarea v-model="form.content" class="textarea" placeholder="写下沿途见闻、路况和感受" /></view>
      <view class="field"><text class="label">位置</text><input v-model="form.location" class="input" placeholder="例如：川西折多山口" /></view>
      <view class="field"><text class="label">心情</text><picker :range="moods" @change="onMoodChange"><view class="picker">{{ moods[moodIndex] }}</view></picker></view>
      <button class="submit-btn" :loading="submitting" @click="submit">发布日记</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { diaryApi } from '@/services/api'

const moods = ['兴奋', '平静', '疲惫', '满足']
const moodValues = ['excited', 'calm', 'tired', 'happy']
const moodIndex = ref(0)
const submitting = ref(false)
const form = reactive({ title: '', content: '', location: '' })

function onMoodChange(event: { detail: { value: string } }) {
  moodIndex.value = Number(event.detail.value)
}

async function submit() {
  if (!form.title || !form.content) {
    uni.showToast({ title: '请补充标题和内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await diaryApi.create({
      title: form.title,
      content: form.content,
      locationName: form.location,
      mood: moodValues[moodIndex.value],
      images: [],
    })
    uni.showToast({ title: '日记已发布', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 300)
  } catch (error) {
    console.error('发布日记失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-page {
  min-height: 100vh;
  background: #0A0A1A;
}

.form-card {
  margin: 24rpx;
  padding: 28rpx;
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
}

.page-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

.page-subtitle {
  display: block;
  margin: 12rpx 0 28rpx;
  font-size: 25rpx;
  color: #8888AA;
  line-height: 1.7;
}

.field {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 10rpx;
}

.input,
.textarea,
.picker {
  width: 100%;
  box-sizing: border-box;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  border-radius: 18rpx;
  padding: 22rpx 20rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00D4FF;
    box-shadow: 0 0 12rpx rgba(0, 212, 255, 0.3);
  }
}

.textarea {
  min-height: 280rpx;
}

.submit-btn {
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;
  border: none;

  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }

  &::after {
    display: none;
  }
}
</style>
