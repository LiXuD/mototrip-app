<template>
  <scroll-view class="form-page" scroll-y>
    <view class="form-card">
      <text class="page-title">创建路线</text>
      <text class="page-subtitle">记录起终点、难度和骑行建议，方便自己与队友复用。</text>
      <view class="field">
        <text class="label">路线名称</text>
        <input v-model="form.name" class="input" placeholder="例如：川西小环线三日骑行" />
      </view>
      <view class="grid">
        <view class="field">
          <text class="label">起点</text>
          <input v-model="form.startPointName" class="input" placeholder="例如：北京市区" />
        </view>
        <view class="field">
          <text class="label">终点</text>
          <input v-model="form.endPointName" class="input" placeholder="例如：怀柔区" />
        </view>
      </view>
      <view class="field">
        <text class="label">路线描述</text>
        <textarea v-model="form.description" class="textarea" placeholder="写下路况、补给点与风景亮点" />
      </view>
      <view class="grid">
        <view class="field">
          <text class="label">预计距离(km)</text>
          <input v-model="form.distance" class="input" type="number" placeholder="例如：80.5" />
        </view>
        <view class="field">
          <text class="label">预计时长(h)</text>
          <input v-model="form.duration" class="input" type="number" placeholder="例如：3.5" />
        </view>
      </view>
      <view class="field">
        <text class="label">路线难度</text>
        <picker :range="difficultyOptions" @change="onDifficultyChange">
          <view class="picker">{{ difficultyOptions[selectedDifficulty] }}</view>
        </picker>
      </view>
      <view class="switch-row">
        <text>公开给社区</text>
        <switch :checked="form.isPublic" color="#FF6B35" @change="form.isPublic = $event.detail.value" />
      </view>
      <button class="submit-btn" :loading="submitting" @click="submit">保存路线</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { routeApi } from '@/services/api'

const difficultyOptions = ['简单', '中等', '困难']
const difficultyValues = ['easy', 'medium', 'hard']
const selectedDifficulty = ref(0)
const submitting = ref(false)
const form = reactive({ 
  name: '', 
  description: '', 
  distance: '', 
  duration: '', 
  startPointName: '',
  endPointName: '',
  isPublic: true 
})

function onDifficultyChange(event: { detail: { value: string } }) {
  selectedDifficulty.value = Number(event.detail.value)
}

async function submit() {
  if (!form.name) {
    uni.showToast({ title: '请填写路线名称', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const result = await routeApi.create({
      name: form.name,
      description: form.description,
      distance: Number(form.distance) || 0,
      duration: Number(form.duration) || 0,
      difficulty: difficultyValues[selectedDifficulty.value],
      isPublic: form.isPublic,
      startPoint: { 
        lat: 0, 
        lng: 0,
        name: form.startPointName || ''
      },
      endPoint: { 
        lat: 0, 
        lng: 0,
        name: form.endPointName || ''
      },
      waypoints: [],
    }) as { id?: number }

    uni.showToast({ title: '路线已保存', icon: 'success' })
    setTimeout(() => {
      if (result?.id) {
        uni.redirectTo({ url: `/pages/route/detail?id=${result.id}` })
      } else {
        uni.navigateBack()
      }
    }, 300)
  } catch (error) {
    console.error('创建路线失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-page { min-height: 100vh; background: #f2f2f7; }
.form-card { margin: 24rpx; padding: 32rpx; background: #fff; border-radius: 24rpx; }
.page-title { display: block; font-size: 42rpx; font-weight: 700; color: #1a1a2e; }
.page-subtitle { display: block; margin: 12rpx 0 28rpx; font-size: 25rpx; color: #8e8e93; line-height: 1.7; }
.field { margin-bottom: 24rpx; }
.label { display: block; font-size: 26rpx; color: #666; margin-bottom: 12rpx; }
.input, .picker, .textarea { 
  width: 100%; 
  height: 88rpx;
  box-sizing: border-box; 
  background: #f7f8fa; 
  border-radius: 20rpx; 
  padding: 0 24rpx; 
  font-size: 28rpx; 
}
.textarea { 
  min-height: 220rpx; 
  height: auto;
  padding: 20rpx 24rpx;
}
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.switch-row { display: flex; align-items: center; justify-content: space-between; font-size: 28rpx; color: #1a1a2e; margin: 12rpx 0 24rpx; }
.submit-btn { background: #ff6b35; color: #fff; border-radius: 20rpx; font-size: 30rpx; }
</style>
