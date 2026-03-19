<template>
  <view class="footprint-page">
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalFootprints }}</text>
        <text class="stat-label">足迹</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.provincesCount }}</text>
        <text class="stat-label">省份</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.citiesCount }}</text>
        <text class="stat-label">城市</text>
      </view>
      <view class="stat-item" @click="goAchievements">
        <text class="stat-num">🏆</text>
        <text class="stat-label">成就</text>
      </view>
    </view>
    <map class="footprint-map" :latitude="centerLat" :longitude="centerLng" :markers="markers" show-location />
    <view class="footprint-list">
      <text class="list-title">最近足迹</text>
      <scroll-view scroll-x class="list-scroll">
        <view class="footprint-card" v-for="fp in footprints" :key="fp.id">
          <text class="fp-location">{{ fp.locationName || fp.city || '未知' }}</text>
          <text class="fp-time">{{ formatTime(fp.visitedAt) }}</text>
        </view>
      </scroll-view>
    </view>
    <view class="fab" @click="addFootprint">+</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const stats = ref<any>({ totalFootprints: 0, provincesCount: 0, citiesCount: 0 })
const footprints = ref<any[]>([])
const markers = ref<any[]>([])
const centerLat = ref(39.9042)
const centerLng = ref(116.4074)

onShow(() => {
  fetchFootprints()
  fetchStats()
})

async function fetchFootprints() {
  const res: any = await uni.request({ url: '/api/footprints/map' })
  if (res.data) {
    footprints.value = res.data
    markers.value = res.data.map((fp: any, index: number) => ({
      id: index,
      latitude: Number(fp.latitude),
      longitude: Number(fp.longitude),
      iconPath: '/static/marker.png',
      width: 30,
      height: 30,
    }))
    if (res.data.length > 0) {
      centerLat.value = Number(res.data[0].latitude)
      centerLng.value = Number(res.data[0].longitude)
    }
  }
}

async function fetchStats() {
  const res: any = await uni.request({ url: '/api/footprints/stats' })
  if (res.data) {
    stats.value = res.data
  }
}

function addFootprint() {
  uni.getLocation({
    type: 'gcj02',
    success: async (res) => {
      const data = { latitude: res.latitude, longitude: res.longitude, locationName: '当前位置' }
      await uni.request({ url: '/api/footprints', method: 'POST', data })
      uni.showToast({ title: '添加成功' })
      fetchFootprints()
      fetchStats()
    },
  })
}

function goAchievements() {
  uni.navigateTo({ url: '/pages/footprint/achievements' })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}-${date.getDate()}`
}
</script>

<style lang="scss" scoped>
.footprint-page { height: 100vh; display: flex; flex-direction: column; }
.stats-bar { display: flex; background: #fff; padding: 20rpx; }
.stat-item { flex: 1; text-align: center; }
.stat-num { font-size: 36rpx; font-weight: bold; color: #007AFF; display: block; }
.stat-label { font-size: 24rpx; color: #999; }
.footprint-map { flex: 1; width: 100%; }
.footprint-list { background: #fff; padding: 20rpx; height: 200rpx; }
.list-title { font-size: 28rpx; font-weight: bold; display: block; margin-bottom: 16rpx; }
.list-scroll { white-space: nowrap; height: 120rpx; }
.footprint-card { display: inline-block; width: 160rpx; padding: 16rpx; margin-right: 16rpx; background: #f5f5f5; border-radius: 8rpx; text-align: center; }
.fp-location { font-size: 24rpx; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fp-time { font-size: 20rpx; color: #999; }
.fab { position: fixed; right: 40rpx; bottom: 60rpx; width: 100rpx; height: 100rpx; background: #007AFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60rpx; color: #fff; box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.4); }
</style>
