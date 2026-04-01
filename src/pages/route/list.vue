<template>
  <view class="route-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索路线名称" 
          placeholder-class="search-placeholder"
          v-model="searchKeyword"
          @confirm="doSearch"
        />
        <text class="search-clear" v-if="searchKeyword" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'all' }" 
        @click="setFilter('all')"
      >
        全部
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'easy' }" 
        @click="setFilter('easy')"
      >
        <text class="filter-dot easy"></text>
        简单
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'medium' }" 
        @click="setFilter('medium')"
      >
        <text class="filter-dot medium"></text>
        中等
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'hard' }" 
        @click="setFilter('hard')"
      >
        <text class="filter-dot hard"></text>
        困难
      </view>
      <view class="filter-sort" @click="toggleSort">
        <text>{{ sortText }}</text>
        <text class="sort-icon">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
      </view>
    </view>

    <!-- 路线列表 -->
    <scroll-view 
      class="route-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="route-card" v-for="route in routes" :key="route.id" @click="goDetail(route.id)">
        <view class="route-cover-wrapper">
          <image class="route-cover" :src="route.coverImage || '/static/default.png'" mode="aspectFill" />
          <view class="route-cover-overlay">
            <view class="route-difficulty-tag" :class="'difficulty-' + route.difficulty">
              {{ getDifficultyText(route.difficulty) }}
            </view>
          </view>
          <view class="route-stats-badge">
            <text>❤️ {{ route.likes || 0 }}</text>
          </view>
        </view>
        <view class="route-content">
          <text class="route-name ellipsis-2">{{ route.name }}</text>
          <view class="route-desc-wrapper" v-if="route.description">
            <text class="route-desc ellipsis-2">{{ route.description }}</text>
          </view>
          <view class="route-meta">
            <view class="meta-item">
              <text class="meta-icon">📏</text>
              <text class="meta-text">{{ route.distance || 0 }}km</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">⏱️</text>
              <text class="meta-text">{{ route.duration || 0 }}h</text>
            </view>
            <view class="meta-item" v-if="route.elevation">
              <text class="meta-icon">🏔️</text>
              <text class="meta-text">{{ route.elevation }}m</text>
            </view>
          </view>
          <view class="route-footer">
            <view class="creator" v-if="route.creator">
              <image class="creator-avatar" :src="route.creator?.avatar || '/static/avatar.png'" />
              <text class="creator-name">{{ route.creator?.nickname || '匿名' }}</text>
            </view>
            <view class="views">
              <text>👁️ {{ route.views || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-dot"></view>
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && routes.length > 0">
        <text>— 已经到底了 —</text>
      </view>
      <view class="empty" v-if="hasFetched && !loading && routes.length === 0">
        <text class="empty-icon">🛣️</text>
        <text class="empty-text">暂无路线</text>
        <text class="empty-hint">快来创建第一条路线吧</text>
      </view>
    </scroll-view>

    <!-- 创建按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRouteStore } from '@/store'
import type { Route, RouteListParams } from '@/types'

const routeStore = useRouteStore()
const currentFilter = ref('all')
const searchKeyword = ref('')
const sortOrder = ref<'desc' | 'asc'>('desc')
const loading = ref(false)
const hasMore = ref(true)
const refreshing = ref(false)
const hasInitialized = ref(false)
const hasFetched = ref(false)

const routes = ref<Route[]>([])

const sortText = computed(() => sortOrder.value === 'desc' ? '最新' : '最早')

function buildQuery(): RouteListParams {
  return {
    difficulty: currentFilter.value === 'all' ? undefined : currentFilter.value,
    keyword: searchKeyword.value || undefined,
    sort: sortOrder.value,
  }
}

function syncListState() {
  routes.value = routeStore.routes
  hasMore.value = routeStore.hasMore
}

function prepareFreshState() {
  routeStore.resetList()
  routes.value = []
  hasMore.value = true
}

async function refreshList() {
  prepareFreshState()
  await fetchRoutes()
}

onShow(() => {
  void refreshList()
})

async function fetchRoutes() {
  loading.value = true
  try {
    await routeStore.fetchRoutes(buildQuery())
    syncListState()
  } finally {
    hasFetched.value = true
    loading.value = false
    refreshing.value = false
  }
}

async function setFilter(filter: string) {
  currentFilter.value = filter
  routeStore.resetList()
  await fetchRoutes()
}

async function toggleSort() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  routeStore.resetList()
  await fetchRoutes()
}

async function doSearch() {
  routeStore.resetList()
  await fetchRoutes()
}

async function clearSearch() {
  searchKeyword.value = ''
  routeStore.resetList()
  await fetchRoutes()
}

async function loadMore() {
  if (hasMore.value && !loading.value) {
    await routeStore.loadMore()
    syncListState()
  }
}

async function onRefresh() {
  refreshing.value = true
  await refreshList()
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/route/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/route/create' })
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  }
  return map[difficulty] || difficulty
}
</script>

<style lang="scss" scoped>
/* ========== 潮流运动风 暗黑主题 ========== */

.route-list-page {
  min-height: 100vh;
  background: #0A0A1A;
}

/* 搜索栏 */
.search-bar {
  padding: 24rpx 32rpx;
  background: rgba(28, 28, 54, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.4);
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(28, 28, 54, 0.6);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 28rpx;
  padding: 16rpx 24rpx;
  height: 80rpx;
  transition: all 0.3s ease;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}

.search-placeholder {
  color: #555577;
}

.search-clear {
  font-size: 28rpx;
  color: #8888AA;
  padding: 8rpx;
  transition: color 0.3s ease;

  &:active {
    color: #FF6B35;
  }
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: rgba(28, 28, 54, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 20rpx 32rpx;
  gap: 16rpx;
  align-items: center;
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.4);
}

.filter-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  border-radius: 24rpx;
  background: rgba(28, 28, 54, 0.6);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  color: #8888AA;
  white-space: nowrap;
  letter-spacing: 1rpx;
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #FF6B35, #FF2D78);
    color: #FFFFFF;
    border-color: transparent;
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.4), 0 0 30rpx rgba(255, 45, 120, 0.2);

    .filter-dot {
      background: #FFFFFF;
      box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.6);
    }
  }
}

.filter-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  transition: all 0.3s ease;

  &.easy { background: #00FF88; }
  &.medium { background: #FFD600; }
  &.hard { background: #FF3B30; }
}

.filter-sort {
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #8888AA;
  padding: 12rpx 20rpx;
  letter-spacing: 1rpx;
  transition: color 0.3s ease;

  &:active {
    color: #00D4FF;
  }
}

.sort-icon {
  margin-left: 8rpx;
  color: #00D4FF;
}

/* 路线列表 */
.route-list {
  height: calc(100vh - 220rpx);
  padding: 24rpx;
}

.route-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:active {
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3), 0 0 40rpx rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.3);
  }
}

.route-cover-wrapper {
  position: relative;
  width: 100%;
  height: 320rpx;
}

.route-cover {
  width: 100%;
  height: 100%;
}

.route-cover-overlay {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
}

.route-difficulty-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  transition: all 0.3s ease;

  &.difficulty-easy {
    background: rgba(0, 255, 136, 0.12);
    color: #00FF88;
    border: 1rpx solid rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 12rpx rgba(0, 255, 136, 0.2);
  }
  &.difficulty-medium {
    background: rgba(255, 214, 0, 0.12);
    color: #FFD600;
    border: 1rpx solid rgba(255, 214, 0, 0.5);
    box-shadow: 0 0 12rpx rgba(255, 214, 0, 0.2);
  }
  &.difficulty-hard {
    background: rgba(255, 59, 48, 0.12);
    color: #FF3B30;
    border: 1rpx solid rgba(255, 59, 48, 0.5);
    box-shadow: 0 0 12rpx rgba(255, 59, 48, 0.2);
  }
}

.route-stats-badge {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  background: rgba(10, 10, 26, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #FFFFFF;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  border: 1rpx solid rgba(42, 42, 74, 0.6);
}

.route-content {
  padding: 24rpx;
}

.route-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
  letter-spacing: 2rpx;
}

.route-desc-wrapper {
  margin-bottom: 16rpx;
}

.route-desc {
  font-size: 26rpx;
  color: #8888AA;
  display: block;
  line-height: 1.5;
  letter-spacing: 1rpx;
}

.route-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 20rpx;
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
  color: #8888AA;
  letter-spacing: 1rpx;
}

.route-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(42, 42, 74, 0.4);
}

.creator {
  display: flex;
  align-items: center;
}

.creator-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  border: 2rpx solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 12rpx rgba(0, 212, 255, 0.15);
}

.creator-name {
  font-size: 26rpx;
  color: #8888AA;
  letter-spacing: 1rpx;
}

.views {
  font-size: 24rpx;
  color: #555577;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  color: #8888AA;
  font-size: 26rpx;
  letter-spacing: 1rpx;

  text {
    margin-left: 12rpx;
  }
}

.loading-dot {
  width: 20rpx;
  height: 20rpx;
  background: #00D4FF;
  border-radius: 50%;
  box-shadow: 0 0 12rpx rgba(0, 212, 255, 0.6);
  animation: loading-pulse 1s infinite ease-in-out;
}

@keyframes loading-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
    box-shadow: 0 0 4rpx rgba(0, 212, 255, 0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 20rpx rgba(0, 212, 255, 0.8);
  }
}

.no-more {
  text-align: center;
  padding: 40rpx;
  color: #555577;
  font-size: 26rpx;
  letter-spacing: 2rpx;
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
  color: #FFFFFF;
  font-weight: 600;
  margin-bottom: 12rpx;
  letter-spacing: 3rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #555577;
  letter-spacing: 1rpx;
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF2D78 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4), 0 0 40rpx rgba(255, 45, 120, 0.2);
  animation: pulse-glow 2s infinite ease-in-out;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.92);
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.6), 0 0 60rpx rgba(255, 45, 120, 0.4);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4), 0 0 40rpx rgba(255, 45, 120, 0.2);
  }
  50% {
    box-shadow: 0 8rpx 40rpx rgba(255, 107, 53, 0.6), 0 0 60rpx rgba(255, 45, 120, 0.4);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
  text-shadow: 0 0 16rpx rgba(255, 255, 255, 0.4);
}
</style>
