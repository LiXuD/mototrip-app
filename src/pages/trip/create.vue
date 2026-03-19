<template>
  <scroll-view class="form-page" scroll-y>
    <view class="form-card">
      <text class="page-title">创建行程</text>
      <text class="page-subtitle">把路线、日期、预算和同行计划整合成一份出发清单。</text>
      <view class="field"><text class="label">行程名称</text><input v-model="form.name" class="input" placeholder="例如：滇西北五日慢骑" /></view>
      <view class="field"><text class="label">出发日期</text><input v-model="form.startDate" class="input" placeholder="2026-04-01" /></view>
      <view class="field"><text class="label">返程日期</text><input v-model="form.endDate" class="input" placeholder="2026-04-05" /></view>
      <view class="field"><text class="label">行程说明</text><textarea v-model="form.notes" class="textarea" placeholder="补充住宿、预算和集合点" /></view>
      <view class="field"><text class="label">预算（元）</text><input v-model="form.budget" class="input" type="number" /></view>
      <button class="submit-btn" :loading="submitting" @click="submit">保存行程</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { tripApi } from '@/services/api'

const submitting = ref(false)
const form = reactive({ name: '', startDate: '', endDate: '', notes: '', budget: '3000' })

async function submit() {
  if (!form.name || !form.startDate) {
    uni.showToast({ title: '请完善行程名称和日期', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const result = await tripApi.create({
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      description: form.notes,
      notes: `预算：${form.budget} 元`,
      totalDistance: 0,
      status: 'planning',
      waypoints: [],
    }) as { id?: number }

    uni.showToast({ title: '行程已创建', icon: 'success' })
    setTimeout(() => {
      if (result?.id) {
        uni.redirectTo({ url: `/pages/trip/detail?id=${result.id}` })
      } else {
        uni.navigateBack()
      }
    }, 300)
  } catch (error) {
    console.error('创建行程失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-page { min-height: 100vh; background: #f2f2f7; }
.form-card { margin: 24rpx; padding: 28rpx; background: #fff; border-radius: 24rpx; }
.page-title { display: block; font-size: 42rpx; font-weight: 700; color: #1a1a2e; }
.page-subtitle { display: block; margin: 12rpx 0 28rpx; font-size: 25rpx; color: #8e8e93; line-height: 1.7; }
.field { margin-bottom: 24rpx; }
.label { display: block; font-size: 26rpx; color: #666; margin-bottom: 10rpx; }
.input,.textarea { width: 100%; box-sizing: border-box; background: #f7f8fa; border-radius: 18rpx; padding: 22rpx 20rpx; font-size: 28rpx; }
.textarea { min-height: 220rpx; }
.submit-btn { background: #ff6b35; color: #fff; border-radius: 20rpx; font-size: 30rpx; }
</style>
