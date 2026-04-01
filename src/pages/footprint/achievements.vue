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
.achievements-page {
  min-height: 100vh;
  background: #0A0A1A;
}
.achievement-list {
  padding: 20rpx;
}
.achievement-card {
  display: flex;
  align-items: center;
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}
.achievement-card.unlocked {
  border: 2rpx solid rgba(0, 255, 136, 0.5);
  box-shadow: 0 0 16rpx rgba(0, 255, 136, 0.2);
}
.achievement-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}
.achievement-info {
  flex: 1;
}
.achievement-name {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  color: #FFFFFF;
}
.achievement-desc {
  font-size: 24rpx;
  color: #8888AA;
  display: block;
  margin-top: 8rpx;
}
.progress-bar {
  height: 8rpx;
  background: rgba(42, 42, 74, 0.6);
  border-radius: 4rpx;
  margin-top: 12rpx;
}
.progress {
  height: 100%;
  background: linear-gradient(90deg, #00FF88, #00D4FF);
  border-radius: 4rpx;
  transition: all 0.3s ease;
}
.progress-text {
  font-size: 20rpx;
  color: #8888AA;
  margin-top: 8rpx;
  display: block;
}
.unlocked-badge {
  width: 40rpx;
  height: 40rpx;
  background: #00FF88;
  border-radius: 50%;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  box-shadow: 0 0 12rpx rgba(0, 255, 136, 0.5);
}
</style>
