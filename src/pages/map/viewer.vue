<template>
  <view class="map-viewer-page">
    <!-- 地图容器 -->
    <map
      class="map-container"
      :longitude="centerLng"
      :latitude="centerLat"
      :scale="scale"
      :min-scale="3"
      :max-scale="18"
      :enable-satellite="false"
      :show-location="true"
      @regionchange="onRegionChange"
    />

    <!-- 控件 -->
    <view class="controls">
      <view class="control-btn" @click="zoomIn">
        <text>+</text>
      </view>
      <view class="control-btn" @click="zoomOut">
        <text>-</text>
      </view>
      <view class="control-btn" @click="centerMap">
        <text>◎</text>
      </view>
    </view>

    <!-- 信息栏 -->
    <view class="info-bar">
      <text class="info-text">当前缩放: {{ scale }}级</text>
      <text class="info-text" v-if="mapInfo">瓦片: {{ currentTileX }}, {{ currentTileY }}, {{ scale }}</text>
    </view>

    <!-- 离线提示 -->
    <view class="offline-tip" v-if="!isOnline">
      <IconSvg name="offline" :size="24" color="#FFFFFF" /> <text>无网络，使用离线地图</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { mapApi } from '@/services/api'
import type { OfflineMap } from '@/types'

const mapId = ref(0)
const mapInfo = ref<OfflineMap | null>(null)
const centerLat = ref(39.908823)
const centerLng = ref(116.397470)
const scale = ref(12)
const isOnline = ref(true)
const currentTileX = ref(0)
const currentTileY = ref(0)

onLoad((options) => {
  if (options?.id) {
    mapId.value = Number(options.id)
    loadMapInfo()
  }
})

onMounted(() => {
  // 检查网络状态
  checkNetwork()
})

function checkNetwork() {
  const networkType = uni.getNetworkType({
    success: (res) => {
      isOnline.value = res.networkType !== 'none'
    },
    fail: () => {
      isOnline.value = false
    },
  })
}

async function loadMapInfo() {
  try {
    const res = await mapApi.getDetail(mapId.value) as OfflineMap
    mapInfo.value = res

    // 设置地图中心为区域中心
    centerLat.value = (res.minLat + res.maxLat) / 2
    centerLng.value = (res.minLng + res.maxLng) / 2

    // 根据区域大小设置合适的缩放级别
    const latSpan = res.maxLat - res.minLat
    const lngSpan = res.maxLng - res.minLng
    const maxSpan = Math.max(latSpan, lngSpan)

    // 根据区域跨度估算缩放级别
    if (maxSpan > 10) scale.value = 5
    else if (maxSpan > 5) scale.value = 7
    else if (maxSpan > 2) scale.value = 9
    else if (maxSpan > 1) scale.value = 10
    else if (maxSpan > 0.5) scale.value = 12
    else if (maxSpan > 0.1) scale.value = 14
    else scale.value = 16
  } catch (e) {
    console.error('Failed to load map info:', e)
    uni.showToast({
      title: '加载地图信息失败',
      icon: 'none',
    })
  }
}

function onRegionChange(e: any) {
  if (e.type === 'end') {
    // 可以获取当前的中心点和缩放级别
    // 这里可以用于记录用户浏览的位置
  }
}

function zoomIn() {
  if (scale.value < 18) {
    scale.value++
  }
}

function zoomOut() {
  if (scale.value > 3) {
    scale.value--
  }
}

function centerMap() {
  if (mapInfo.value) {
    centerLat.value = (mapInfo.value.minLat + mapInfo.value.maxLat) / 2
    centerLng.value = (mapInfo.value.minLng + mapInfo.value.maxLng) / 2
  }
}
</script>

<style lang="scss" scoped>
.map-viewer-page {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.map-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  right: 20rpx;
  bottom: 120rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.control-btn {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #333;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.info-bar {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  right: 20rpx;
  display: flex;
  justify-content: space-between;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
}

.offline-tip {
  position: absolute;
  top: 80rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 12rpx 24rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 30rpx;
  color: #fff;
  font-size: 24rpx;
}
</style>
