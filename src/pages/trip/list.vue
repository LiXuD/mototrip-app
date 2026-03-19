<template>
  <view class="trip-list-page">
    <!-- 状态筛选 -->
    <view class="status-tabs">
      <view 
        class="status-tab" 
        :class="{ active: currentStatus === 'all' }" 
        @click="setStatus('all')"
      >
        全部
      </view>
      <view 
        class="status-tab" 
        :class="{ active: currentStatus === 'planning' }" 
        @click="setStatus('planning')"
      >
        <text class="tab-dot planning"></text>
        计划中
      </view>
      <view 
        class="status-tab" 
        :class="{ active: currentStatus === 'ongoing' }" 
        @click="setStatus('ongoing')"
      >
        <text class="tab-dot ongoing"></text>
        进行中
      </view>
      <view 
        class="status-tab" 
        :class="{ active: currentStatus === 'completed' }" 
        @click="setStatus('completed')"
      >
        <text class="tab-dot completed"></text>
        已完成
      </view>
    </view>

    <!-- 行程列表 -->
    <scroll-view class="trip-list" scroll-y @scrolltolower="loadMore">
      <view class="trip-card" v-for="trip in trips" :key="trip.id" @click="goDetail(trip.id)">
        <view class="trip-cover-wrapper">
          <image class="trip-cover" :src="trip.coverImage || '/static/default.png'" mode="aspectFill" />
          <view class="trip-status-badge" :class="'status-' + trip.status">
            {{ getStatusText(trip.status) }}
          </view>
        </view>
        <view class="trip-content">
          <text class="trip-name ellipsis">{{ trip.name }}</text>
          <text class="trip-desc ellipsis-2" v-if="trip.description">{{ trip.description }}</text>
          <view class="trip-meta">
            <view class="meta-item">
              <text class="meta-icon">📅</text>
              <text class="meta-text">{{ formatDate(trip.startDate) }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">📏</text>
              <text class="meta-text">{{ trip.totalDistance || 0 }}km</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">📍</text>
              <text class="meta-text">{{ trip.waypoints?.length || 0 }}个途点</text>
            </view>
          </view>
          <!-- 进度条 -->
          <view class="trip-progress" v-if="trip.status === 'ongoing'">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: (trip.progress || 0) + '%' }"></view>
            </view>
            <text class="progress-text">已骑行 {{ trip.progress || 0 }}%</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-dot"></view>
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && trips.length > 0">
        <text>— 已经到底了 —</text>
      </view>
      <view class="empty" v-if="!loading && trips.length === 0">
        <text class="empty-icon">🏍️</text>
        <text class="empty-text">暂无行程</text>
        <text class="empty-hint">开始规划你的第一次摩旅吧！</text>
        <button class="empty-btn" @click="goCreate">创建行程</button>
      </view>
    </scroll-view>

    <!-- 创建按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTripStore } from '@/store'
import type { Trip, TripListParams } from '@/types'

const tripStore = useTripStore()
const currentStatus = ref('all')

const trips = ref<Trip[]>([])
const loading = ref(false)
const hasMore = ref(true)

function buildQuery(): TripListParams {
  return {
    status: currentStatus.value === 'all' ? undefined : currentStatus.value,
  }
}

function syncListState() {
  trips.value = tripStore.trips
  hasMore.value = tripStore.hasMore
}

function prepareFreshState() {
  tripStore.resetList()
  trips.value = []
  hasMore.value = true
}

async function refreshList() {
  prepareFreshState()
  await fetchTrips()
}

onShow(() => {
  void refreshList()
})

async function fetchTrips() {
  loading.value = true
  try {
    await tripStore.fetchTrips(buildQuery())
    syncListState()
  } finally {
    loading.value = false
  }
}

async function setStatus(status: string) {
  currentStatus.value = status
  tripStore.resetList()
  await fetchTrips()
}

async function loadMore() {
  if (hasMore.value && !loading.value) {
    await tripStore.loadMore()
    syncListState()
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/trip/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/trip/create' })
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    planning: '计划中',
    ongoing: '进行中',
    completed: '已完成',
  }
  return map[status] || status
}

function formatDate(dateStr: string) {
  if (!dateStr) return '待定'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style lang="scss" scoped>
.trip-list-page {
  min-height: 100vh;
  background: #F2F2F7;
}

/* 状态筛选 */
.status-tabs {
  display: flex;
  background: #FFFFFF;
  padding: 20rpx 24rpx;
  gap: 12rpx;
}

.status-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  border-radius: 24rpx;
  background: #F2F2F7;
  color: #8E8E93;
  
  &.active {
    background: #FF6B35;
    color: #FFFFFF;
    
    .tab-dot {
      background: #FFFFFF;
    }
  }
}

.tab-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  
  &.planning { background: #5AC8FA; }
  &.ongoing { background: #FF9500; }
  &.completed { background: #34C759; }
}

/* 行程列表 */
.trip-list {
  height: calc(100vh - 140rpx);
  padding: 24rpx;
}

.trip-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.trip-cover-wrapper {
  position: relative;
  width: 100%;
  height: 280rpx;
}

.trip-cover {
  width: 100%;
  height: 100%;
}

.trip-status-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  
  &.status-planning {
    background: rgba(90, 200, 250, 0.95);
    color: #FFFFFF;
  }
  &.status-ongoing {
    background: rgba(255, 149, 0, 0.95);
    color: #FFFFFF;
  }
  &.status-completed {
    background: rgba(52, 199, 89, 0.95);
    color: #FFFFFF;
  }
}

.trip-content {
  padding: 24rpx;
}

.trip-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
  display: block;
  margin-bottom: 8rpx;
}

.trip-desc {
  font-size: 26rpx;
  color: #8E8E93;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.trip-meta {
  display: flex;
  gap: 24rpx;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #8E8E93;
}

/* 进度条 */
.trip-progress {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F2F2F7;
}

.progress-bar {
  height: 12rpx;
  background: #F2F2F7;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35, #FF8A5C);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #FF6B35;
  font-weight: 500;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  color: #8E8E93;
  font-size: 26rpx;
  
  text {
    margin-left: 12rpx;
  }
}

.loading-dot {
  width: 20rpx;
  height: 20rpx;
  background: #FF6B35;
  border-radius: 50%;
  animation: loading 1s infinite;
}

@keyframes loading {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.no-more {
  text-align: center;
  padding: 40rpx;
  color: #C7C7CC;
  font-size: 26rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #8E8E93;
  margin-bottom: 32rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
  color: #FFFFFF;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  
  &::after {
    display: none;
  }
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  
  &:active {
    transform: scale(0.95);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
}
</style>
