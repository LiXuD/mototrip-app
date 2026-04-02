<template>
  <view class="route-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-box">
        <IconSvg name="search" :size="32" color="#8E8E93" />
        <input 
          class="search-input" 
          placeholder="搜索路线名称" 
          placeholder-class="search-placeholder"
          v-model="searchKeyword"
          @confirm="doSearch"
        />
        <IconSvg name="close" :size="28" color="#C7C7CC" v-if="searchKeyword" @click="clearSearch" />
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
            <IconSvg name="heart" :size="22" color="#FFFFFF" /> <text>{{ route.likes || 0 }}</text>
          </view>
        </view>
        <view class="route-content">
          <text class="route-name ellipsis-2">{{ route.name }}</text>
          <view class="route-desc-wrapper" v-if="route.description">
            <text class="route-desc ellipsis-2">{{ route.description }}</text>
          </view>
          <view class="route-meta">
            <view class="meta-item">
              <IconSvg name="ruler" :size="24" color="#8E8E93" />
              <text class="meta-text">{{ route.distance || 0 }}km</text>
            </view>
            <view class="meta-item">
              <IconSvg name="clock" :size="24" color="#8E8E93" />
              <text class="meta-text">{{ route.duration || 0 }}h</text>
            </view>
            <view class="meta-item" v-if="route.elevation">
              <IconSvg name="mountain" :size="24" color="#8E8E93" />
              <text class="meta-text">{{ route.elevation }}m</text>
            </view>
          </view>
          <view class="route-footer">
            <view class="creator" v-if="route.creator">
              <image class="creator-avatar" :src="route.creator?.avatar || '/static/avatar.png'" />
              <text class="creator-name">{{ route.creator?.nickname || '匿名' }}</text>
            </view>
            <view class="views">
              <IconSvg name="eye" :size="24" color="#8E8E93" /> <text>{{ route.views || 0 }}</text>
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
        <IconSvg name="empty_road" :size="96" color="#8E8E93" />
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
.route-list-page {
  min-height: 100vh;
  background: #F2F2F7;
  position: relative;
}

/* 搜索栏 */
.search-bar {
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.search-box {
  display: flex;
  align-items: center;
  background: #F2F2F7;
  border-radius: 28rpx;
  padding: 16rpx 24rpx;
  height: 88rpx;
  transition: all 0.3s ease;
  
  &:active {
    background: #E8E8ED;
  }
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A2E;
}

.search-placeholder {
  color: #C7C7CC;
  font-size: 28rpx;
}

.search-clear {
  font-size: 28rpx;
  color: #C7C7CC;
  padding: 8rpx;
  transition: color 0.3s ease;
  
  &:active {
    color: #FF6B35;
  }
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  gap: 16rpx;
  align-items: center;
  border-bottom: 1rpx solid #F2F2F7;
  position: sticky;
  top: 140rpx;
  z-index: 99;
}

.filter-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  border-radius: 24rpx;
  background: #F2F2F7;
  color: #8E8E93;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.96);
  }
  
  &.active {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
    color: #FFFFFF;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
    
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
  
  &.easy { background: #4CD964; }
  &.medium { background: #FF9500; }
  &.hard { background: #FF3B30; }
}

.filter-sort {
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #8E8E93;
  padding: 12rpx 20rpx;
  transition: color 0.3s ease;
  
  &:active {
    color: #FF6B35;
  }
}

.sort-icon {
  margin-left: 8rpx;
  color: #FF6B35;
}

/* 路线列表 */
.route-list {
  height: calc(100vh - 240rpx);
  padding: 24rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.route-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #F2F2F7;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.98);
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
  transition: all 0.3s ease;
  
  &.difficulty-easy {
    background: rgba(76, 217, 100, 0.9);
    color: #FFFFFF;
    box-shadow: 0 0 12rpx rgba(76, 217, 100, 0.3);
  }
  &.difficulty-medium {
    background: rgba(255, 149, 0, 0.9);
    color: #FFFFFF;
    box-shadow: 0 0 12rpx rgba(255, 149, 0, 0.3);
  }
  &.difficulty-hard {
    background: rgba(255, 59, 48, 0.9);
    color: #FFFFFF;
    box-shadow: 0 0 12rpx rgba(255, 59, 48, 0.3);
  }
}

.route-stats-badge {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.route-content {
  padding: 24rpx;
}

.route-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.route-desc-wrapper {
  margin-bottom: 16rpx;
}

.route-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
  line-height: 1.5;
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
  color: #8E8E93;
}

.route-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #F2F2F7;
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
  border: 2rpx solid #F2F2F7;
}

.creator-name {
  font-size: 26rpx;
  color: #8E8E93;
}

.views {
  font-size: 24rpx;
  color: #8E8E93;
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
  box-shadow: 0 0 12rpx rgba(255, 107, 53, 0.4);
  animation: loading-pulse 1s infinite ease-in-out;
}

@keyframes loading-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
    box-shadow: 0 0 4rpx rgba(255, 107, 53, 0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 20rpx rgba(255, 107, 53, 0.8);
  }
}

.no-more {
  text-align: center;
  padding: 40rpx;
  color: #C7C7CC;
  font-size: 26rpx;
  letter-spacing: 1rpx;
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
  color: #8E8E93;
}

.empty-text {
  font-size: 32rpx;
  color: #1A1A2E;
  font-weight: 600;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #8E8E93;
  letter-spacing: 0.5rpx;
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
  animation: pulse-glow 2s infinite ease-in-out;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.92);
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.6);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  }
  50% {
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.6), 0 0 40rpx rgba(255, 107, 53, 0.3);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
  text-shadow: 0 0 16rpx rgba(255, 255, 255, 0.4);
}
</style>
