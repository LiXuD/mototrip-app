<template>
  <view class="poster-page">
    <view class="poster-preview" v-if="share">
      <image :src="share.coverImage || '/static/poster-bg.png'" class="poster-bg" mode="aspectFill" />
      <view class="poster-content">
        <text class="poster-title">{{ share.title }}</text>
        <text class="poster-summary">{{ share.summary }}</text>
        <view class="poster-stats">
          <view class="stat"><text class="stat-num">{{ share.totalDistance }}</text><text class="stat-label">公里</text></view>
          <view class="stat"><text class="stat-num">{{ share.duration }}</text><text class="stat-label">天</text></view>
          <view class="stat"><text class="stat-num">{{ share.waypointCount }}</text><text class="stat-label">地点</text></view>
        </view>
        <view class="poster-footer"><text>来自摩旅助手</text></view>
      </view>
    </view>
    <view class="actions">
      <button class="btn" @click="savePoster">保存海报</button>
      <button class="btn primary" @click="shareToWechat">分享到微信</button>
    </view>
    <view class="history-section" v-if="shares.length > 0">
      <text class="section-title">历史分享</text>
      <view class="share-item" v-for="s in shares" :key="s.id" @click="loadShare(s.id)">
        <text class="share-title">{{ s.title }}</text>
        <text class="share-time">{{ formatTime(s.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const share = ref<any>(null)
const shares = ref<any[]>([])
const tripId = ref(0)

onLoad((options: any) => {
  if (options.tripId) { tripId.value = options.tripId; generatePoster() }
  fetchShares()
})

async function generatePoster() {
  const res: any = await uni.request({ url: `/api/shares/trip/${tripId.value}`, method: 'POST' })
  if (res.data) { share.value = res.data }
}

async function fetchShares() {
  const res: any = await uni.request({ url: '/api/shares/my' })
  if (res.data) { shares.value = res.data }
}

async function loadShare(id: number) {
  const res: any = await uni.request({ url: `/api/shares/${id}` })
  if (res.data) { share.value = res.data }
}

function savePoster() { uni.showToast({ title: '保存成功' }) }
function shareToWechat() { uni.showToast({ title: '分享功能开发中' }) }
function formatTime(dateStr: string) { const date = new Date(dateStr); return `${date.getMonth() + 1}-${date.getDate()}` }
</script>

<style lang="scss" scoped>
.poster-page {
  min-height: 100vh;
  background: #0A0A1A;
}
.poster-preview {
  position: relative;
  height: 600rpx;
  overflow: hidden;
}
.poster-bg {
  width: 100%;
  height: 100%;
}
.poster-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(10, 10, 26, 0.9));
  padding: 40rpx;
  color: #FFFFFF;
}
.poster-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  letter-spacing: 1rpx;
}
.poster-summary {
  font-size: 26rpx;
  display: block;
  margin-top: 10rpx;
  opacity: 0.9;
  color: #FFFFFF;
}
.poster-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 30rpx;
}
.stat {
  text-align: center;
}
.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  color: #FFFFFF;
}
.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
  color: #FFFFFF;
}
.poster-footer {
  text-align: center;
  margin-top: 30rpx;
  font-size: 24rpx;
  opacity: 0.7;
  color: #FFFFFF;
}
.actions {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
}
.btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  background: rgba(28, 28, 54, 0.8);
  color: #8888AA;
  text-align: center;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }
}
.btn.primary {
  background: linear-gradient(135deg, #00D4FF, #7B2FFF);
  color: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 212, 255, 0.3);
}
.history-section {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  padding: 30rpx;
  margin-top: 20rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}
.share-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.4);
  transition: all 0.3s ease;
}
.share-item:last-child {
  border-bottom: none;
}
.share-title {
  font-size: 28rpx;
  color: #FFFFFF;
}
.share-time {
  font-size: 24rpx;
  color: #8888AA;
}
</style>
