<template>
  <view class="achievements-page">
    <scroll-view scroll-y class="achievement-list">
      <view class="achievement-card" :class="{ unlocked: achievement.unlocked }" v-for="achievement in achievements" :key="achievement.id">
        <view class="achievement-icon">{{ achievement.icon }}</view>
        <view class="achievement-info">
          <text class="achievement-name">{{ achievement.name }}</text>
          <text class="achievement-desc">{{ achievement.description }}</text>
          <view class="progress-bar"><view class="progress" :style="{ width: getProgress(achievement) }"></view></view>
          <text class="progress-text">{{ achievement.currentCount }}/{{ achievement.targetCount }}</text>
        </view>
        <view v-if="achievement.unlocked" class="unlocked-badge">✓</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const achievements = ref<any[]>([])

onShow(() => { fetchAchievements() })

async function fetchAchievements() {
  const res: any = await uni.request({ url: '/api/footprints/achievements' })
  if (res.data) { achievements.value = res.data }
}

function getProgress(achievement: any) {
  const percent = Math.min((achievement.currentCount / achievement.targetCount) * 100, 100)
  return `${percent}%`
}
</script>

<style lang="scss" scoped>
.achievements-page { min-height: 100vh; background: #f5f5f5; }
.achievement-list { padding: 20rpx; }
.achievement-card { display: flex; align-items: center; background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }
.achievement-card.unlocked { border: 2rpx solid #34C759; }
.achievement-icon { font-size: 60rpx; margin-right: 20rpx; }
.achievement-info { flex: 1; }
.achievement-name { font-size: 28rpx; font-weight: bold; display: block; }
.achievement-desc { font-size: 24rpx; color: #666; display: block; margin-top: 8rpx; }
.progress-bar { height: 8rpx; background: #eee; border-radius: 4rpx; margin-top: 12rpx; }
.progress { height: 100%; background: #007AFF; border-radius: 4rpx; }
.progress-text { font-size: 20rpx; color: #999; margin-top: 8rpx; display: block; }
.unlocked-badge { width: 40rpx; height: 40rpx; background: #34C759; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24rpx; }
</style>
