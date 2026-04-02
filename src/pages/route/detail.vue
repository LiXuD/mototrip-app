<template>
  <view class="route-detail-page">
    <!-- 地图区域 -->
    <view class="map-container">
      <map 
        class="route-map"
        :latitude="route?.startPoint?.lat || 39.908823"
        :longitude="route?.startPoint?.lng || 116.397470"
        :markers="markers"
        :polyline="polyline"
        :scale="10"
        show-location
      />
      
      <!-- 夜间警告 -->
      <NightWarning 
        v-if="currentLocation.lat"
        :lat="currentLocation.lat" 
        :lng="currentLocation.lng"
        @nightChange="handleNightChange"
      />
      
      <!-- 显示危险区域按钮 -->
      <view class="show-dangers-btn" @click="showDangerZones = !showDangerZones">
        <IconSvg v-if="showDangerZones" name="map" :size="28" color="#1A1A2E" />
        <IconSvg v-else name="warning" :size="28" color="#1A1A2E" />
        <text class="btn-text">{{ showDangerZones ? '查看路线' : '危险区域' }}</text>
        <view class="badge" v-if="dangerWarnings.length > 0">
          <text>{{ dangerWarnings.length }}</text>
        </view>
      </view>
    </view>

    <!-- 危险区域列表 -->
    <scroll-view class="danger-zones-panel" scroll-y v-if="showDangerZones">
      <view class="panel-header">
        <view class="panel-title-wrapper">
          <IconSvg name="warning" :size="32" color="#1A1A2E" />
          <text class="panel-title">沿途危险区域</text>
        </view>
        <text class="panel-subtitle">共 {{ dangerWarnings.length }} 处</text>
      </view>
      
      <DangerZones 
        :zones="dangerWarnings" 
        :noParkingZones="noParkingWarnings"
        @zoneClick="handleDangerClick"
      />
    </scroll-view>

    <!-- 路线信息 -->
    <scroll-view class="route-info" scroll-y v-else>
      <view class="route-header">
        <view class="cover-wrapper">
          <image class="cover-image" :src="route?.coverImage || '/static/default.png'" mode="aspectFill" />
          <view class="cover-overlay">
            <view class="difficulty-badge" :class="'difficulty-' + route?.difficulty">
              {{ getDifficultyText(route?.difficulty) }}
            </view>
          </view>
        </view>
        <view class="route-title-section">
          <text class="route-name">{{ route?.name }}</text>
          <view class="route-tags">
            <view class="tag-item">
              <IconSvg name="ruler" :size="26" color="#8E8E93" />
              <text class="tag-text">{{ route?.distance }}km</text>
            </view>
            <view class="tag-item">
              <IconSvg name="clock" :size="26" color="#8E8E93" />
              <text class="tag-text">{{ route?.duration }}h</text>
            </view>
            <view class="tag-item" v-if="route?.elevation">
              <IconSvg name="mountain" :size="26" color="#8E8E93" />
              <text class="tag-text">{{ route?.elevation }}m</text>
            </view>
          </view>
        </view>
      </view>

      <view class="content-section">
        <view class="section-header">
          <IconSvg name="empty_note" :size="30" color="#1A1A2E" />
          <text class="section-title">路线描述</text>
        </view>
        <text class="description">{{ route?.description || '暂无描述' }}</text>
      </view>

      <view class="content-section" v-if="route?.waypoints?.length">
        <view class="section-header">
          <IconSvg name="map" :size="30" color="#1A1A2E" />
          <text class="section-title">途经景点</text>
          <text class="section-count">{{ route.waypoints.length }}个</text>
        </view>
        <view class="waypoints-list">
          <view class="waypoint-item" v-for="(wp, index) in route.waypoints" :key="wp.id">
            <view class="waypoint-number">{{ index + 1 }}</view>
            <view class="waypoint-info">
              <text class="waypoint-name">{{ wp.name }}</text>
              <text class="waypoint-type">{{ getWaypointTypeText(wp.type) }}</text>
            </view>
            <text class="waypoint-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="content-section">
        <view class="section-header">
          <IconSvg name="info" :size="30" color="#1A1A2E" />
          <text class="section-title">路线信息</text>
        </view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">起点</text>
            <text class="info-value">{{ route?.startPoint?.name || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">终点</text>
            <text class="info-value">{{ route?.endPoint?.name || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">难度</text>
            <text class="info-value difficulty-text" :class="'difficulty-' + route?.difficulty">
              {{ getDifficultyText(route?.difficulty) }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">热度</text>
            <text class="info-value">
              <IconSvg name="heart" :size="28" color="#8E8E93" /> <text>{{ route?.likes || 0 }}</text>
              <IconSvg name="eye" :size="28" color="#8E8E93" style="margin-left: 16rpx" /> <text>{{ route?.views || 0 }}</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="action-bar">
        <button class="btn-primary" @click="startNavigation">
          <IconSvg name="compass" :size="32" color="#FFFFFF" />
          <text>开始导航</text>
        </button>
        <button class="btn-secondary" @click="reportDanger">
          <IconSvg name="warning" :size="32" color="#FF6B35" />
          <text>上报危险</text>
        </button>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { routeApi, warningApi } from '@/services/api'
import NightWarning from '@/components/NightWarning.vue'
import DangerZones from '@/components/DangerZones.vue'
import type { Route, DangerWarning, NoParkingWarning } from '@/types'

const route = ref<Route | null>(null)
const showDangerZones = ref(false)
const dangerWarnings = ref<DangerWarning[]>([])
const noParkingWarnings = ref<NoParkingWarning[]>([])
const isNight = ref(false)
const currentLocation = ref({ lat: 0, lng: 0 })

// 地图标记
const markers = computed(() => {
  const result = []
  if (route.value?.startPoint) {
    result.push({
      id: 1,
      latitude: route.value.startPoint.lat,
      longitude: route.value.startPoint.lng,
      iconPath: '/static/marker-start.png',
      width: 32,
      height: 40,
      callout: {
        content: '起点',
        color: '#FFFFFF',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#FF6B35',
        padding: 8,
        display: 'ALWAYS',
      },
    })
  }
  if (route.value?.endPoint) {
    result.push({
      id: 2,
      latitude: route.value.endPoint.lat,
      longitude: route.value.endPoint.lng,
      iconPath: '/static/marker-end.png',
      width: 32,
      height: 40,
      callout: {
        content: '终点',
        color: '#FFFFFF',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#34C759',
        padding: 8,
        display: 'ALWAYS',
      },
    })
  }
  // 添加危险区域标记
  dangerWarnings.value.forEach((dz, index) => {
    result.push({
      id: 100 + index,
      latitude: dz.location.lat,
      longitude: dz.location.lng,
      iconPath: '/static/marker-danger.png',
      width: 28,
      height: 28,
      callout: {
        content: dz.name,
        color: '#FFFFFF',
        fontSize: 11,
        borderRadius: 6,
        bgColor: '#FF3B30',
        padding: 6,
        display: 'ALWAYS',
      },
    })
  })
  return result
})

// 路线折线
const polyline = computed(() => {
  if (!route.value || !route.value.waypoints || !route.value.waypoints.length) return []
  return [{
    points: route.value.waypoints.map(wp => ({
      latitude: wp.location.lat,
      longitude: wp.location.lng,
    })),
    color: '#FF6B35',
    width: 6,
    dottedLine: false,
  }]
})

onLoad((options) => {
  const id = options?.id
  if (id) {
    loadRouteDetail(Number(id))
    loadCurrentLocation()
  }
})

async function loadRouteDetail(id: number) {
  try {
    const data = await routeApi.getDetail(id) as Route
    // 清理图片URL，移除可能的反引号
    if (data.coverImage) {
      data.coverImage = data.coverImage.replace(/^`|`$/g, '')
    }
    route.value = data
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

async function loadCurrentLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      currentLocation.value = { lat: res.latitude, lng: res.longitude }
      loadWarnings(res.latitude, res.longitude)
    },
  })
}

async function loadWarnings(lat: number, lng: number) {
  try {
    const result = await warningApi.getWarnings(lat, lng, 10000) as {
      nightWarning: { isNight: boolean }
      dangerWarnings: DangerWarning[]
      noParkingWarnings: NoParkingWarning[]
    }
    dangerWarnings.value = result.dangerWarnings || []
    noParkingWarnings.value = result.noParkingWarnings || []
  } catch (e) {
    console.error('加载警告失败:', e)
  }
}

function handleNightChange(night: boolean) {
  isNight.value = night
}

function handleDangerClick(zone: import('@/types').DangerWarning | import('@/types').DangerZone) {
  uni.showModal({
    title: zone.name,
    content: `类型: ${zone.type}\n严重程度: ${zone.severity}\n距离: ${zone.distance}m`,
    showCancel: false,
  })
}

function startNavigation() {
  if (!route.value?.startPoint) return
  uni.openLocation({
    latitude: route.value.startPoint.lat,
    longitude: route.value.startPoint.lng,
    name: route.value.startPoint.name,
  })
}

function reportDanger() {
  uni.navigateTo({ url: '/pages/safety/danger-report' })
}

function getDifficultyText(difficulty?: string): string {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  }
  return map[difficulty || ''] || difficulty || ''
}

function getWaypointTypeText(type: string): string {
  const map: Record<string, string> = {
    scenic: '景点',
    restaurant: '餐厅',
    hotel: '酒店',
    gas: '加油站',
    repair: '维修点',
    other: '其他',
  }
  return map[type] || type
}
</script>

<style lang="scss" scoped>
.route-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 地图 */
.map-container {
  position: relative;
  height: 50vh;
}

.route-map {
  width: 100%;
  height: 100%;
}

.show-dangers-btn {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  background: #FFFFFF;
  padding: 16rpx 24rpx;
  border-radius: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  z-index: 10;
  
  .btn-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }
  
  .btn-text {
    font-size: 26rpx;
    color: #1A1A2E;
    font-weight: 500;
  }
  
  .badge {
    background: #FF3B30;
    color: #FFFFFF;
    padding: 4rpx 12rpx;
    border-radius: 16rpx;
    margin-left: 12rpx;
    font-size: 22rpx;
    font-weight: 600;
  }
}

/* 危险区域面板 */
.danger-zones-panel, .route-info {
  flex: 1;
  background: #F2F2F7;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
}

.panel-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.panel-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.panel-subtitle {
  font-size: 26rpx;
  color: #8E8E93;
}

/* 路线信息 */
.route-header {
  background: #FFFFFF;
  padding-bottom: 24rpx;
}

.cover-wrapper {
  position: relative;
  width: 100%;
  height: 360rpx;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
}

.difficulty-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  
  &.difficulty-easy {
    background: #34C759;
    color: #FFFFFF;
  }
  &.difficulty-medium {
    background: #FF9500;
    color: #FFFFFF;
  }
  &.difficulty-hard {
    background: #FF3B30;
    color: #FFFFFF;
  }
}

.route-title-section {
  padding: 24rpx 32rpx;
}

.route-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A2E;
  display: block;
  margin-bottom: 16rpx;
}

.route-tags {
  display: flex;
  gap: 24rpx;
}

.tag-item {
  display: flex;
  align-items: center;
}

.tag-icon {
  font-size: 26rpx;
  margin-right: 6rpx;
}

.tag-text {
  font-size: 26rpx;
  color: #8E8E93;
}

/* 内容区块 */
.content-section {
  background: #FFFFFF;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-icon {
  font-size: 30rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.section-count {
  margin-left: auto;
  font-size: 24rpx;
  color: #8E8E93;
}

.description {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.7;
}

/* 途经点 */
.waypoints-list {
  display: flex;
  flex-direction: column;
}

.waypoint-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F2F2F7;
  
  &:last-child {
    border-bottom: none;
  }
}

.waypoint-number {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.waypoint-info {
  flex: 1;
}

.waypoint-name {
  font-size: 28rpx;
  color: #1A1A2E;
  display: block;
  margin-bottom: 4rpx;
}

.waypoint-type {
  font-size: 24rpx;
  color: #8E8E93;
}

.waypoint-arrow {
  font-size: 32rpx;
  color: #C7C7CC;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
  background: #F8F8F8;
  padding: 20rpx;
  border-radius: 16rpx;
}

.info-label {
  font-size: 24rpx;
  color: #8E8E93;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: #1A1A2E;
  
  &.difficulty-text {
    &.difficulty-easy { color: #34C759; }
    &.difficulty-medium { color: #FF9500; }
    &.difficulty-hard { color: #FF3B30; }
  }
}

/* 操作栏 */
.action-bar {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  margin-top: 16rpx;
}

.btn-primary, .btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  
  .btn-icon {
    margin-right: 8rpx;
    font-size: 32rpx;
  }
  
  &::after {
    display: none;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
  color: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
}

.btn-secondary {
  background: #FFFFFF;
  color: #FF6B35;
  border: 2rpx solid #FF6B35;
}

.bottom-space {
  height: 60rpx;
}
</style>
