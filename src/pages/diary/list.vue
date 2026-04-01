<template>
  <view class="diary-list-page">
    <!-- 标签筛选 -->
    <view class="filter-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTag === 'all' }" 
        @click="setTag('all')"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTag === 'trip' }" 
        @click="setTag('trip')"
      >
        旅途
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTag === 'daily' }" 
        @click="setTag('daily')"
      >
        日常
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTag === 'repair' }" 
        @click="setTag('repair')"
      >
        修车
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTag === 'gear' }" 
        @click="setTag('gear')"
      >
        装备
      </view>
    </view>

    <!-- 日记列表 -->
    <scroll-view class="diary-list" scroll-y @scrolltolower="loadMore">
      <view class="diary-card" v-for="diary in diaries" :key="diary.id" @click="goDetail(diary.id)">
        <!-- 用户信息 -->
        <view class="diary-header">
          <image class="user-avatar" :src="diary.user?.avatar || '/static/avatar.png'" />
          <view class="user-info">
            <text class="user-name">{{ diary.user?.nickname || '骑士' }}</text>
            <view class="diary-meta-row">
              <text class="diary-time">{{ formatTime(diary.createdAt) }}</text>
              <text class="diary-tag tag tag-primary" v-if="diary.tag">{{ diary.tag }}</text>
            </view>
          </view>
          <text class="diary-mood" v-if="diary.mood">{{ getMoodEmoji(diary.mood) }}</text>
        </view>

        <!-- 内容 -->
        <view class="diary-body">
          <text class="diary-title ellipsis-2">{{ diary.title }}</text>
          <text class="diary-content ellipsis-3" v-if="diary.content">{{ diary.content }}</text>
        </view>

        <!-- 图片 -->
        <scroll-view class="diary-images" scroll-x v-if="diary.images && diary.images.length > 0">
          <image 
            class="diary-img" 
            v-for="(img, idx) in diary.images.slice(0, 4)" 
            :key="idx" 
            :src="img" 
            mode="aspectFill" 
          />
          <view class="more-images" v-if="diary.images.length > 4">
            <text>+{{ diary.images.length - 4 }}</text>
          </view>
        </scroll-view>

        <!-- 位置和天气 -->
        <view class="diary-meta" v-if="diary.locationName || diary.weather">
          <text class="meta-icon" v-if="diary.locationName">📍 {{ diary.locationName }}</text>
          <text class="meta-icon" v-if="diary.weather">🌤️ {{ diary.weather }} {{ diary.temperature }}°C</text>
        </view>

        <!-- 统计 -->
        <view class="diary-footer">
          <view class="stat-item" @click.stop="likeDiary(diary.id)">
            <text class="stat-icon">{{ diary.isLiked ? '❤️' : '🤍' }}</text>
            <text class="stat-text">{{ diary.likes || 0 }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-icon">💬</text>
            <text class="stat-text">{{ diary.comments || 0 }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-icon">🔖</text>
            <text class="stat-text" v-if="diary.trip">{{ diary.trip.name }}</text>
            <text class="stat-text" v-else>日常</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-dot"></view>
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && diaries.length > 0">
        <text>— 已经到底了 —</text>
      </view>
      <view class="empty" v-if="hasFetched && !loading && diaries.length === 0">
        <text class="empty-icon">📖</text>
        <text class="empty-text">还没有日记</text>
        <text class="empty-hint">记录你的摩旅故事</text>
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
import { useDiaryStore } from '@/store'
import type { Diary, DiaryListParams } from '@/types'

const diaryStore = useDiaryStore()
const currentTag = ref('all')

const diaries = ref<Diary[]>([])
const loading = ref(false)
const hasMore = ref(true)
const hasInitialized = ref(false)
const hasFetched = ref(false)

function buildQuery(): DiaryListParams {
  return {
    tag: currentTag.value === 'all' ? undefined : currentTag.value,
  }
}

function syncListState() {
  diaries.value = diaryStore.diaries
  hasMore.value = diaryStore.hasMore
}

function prepareFreshState() {
  diaryStore.resetList()
  diaries.value = []
  hasMore.value = true
}

async function refreshList() {
  prepareFreshState()
  await fetchDiaries()
}

onShow(() => {
  void refreshList()
})

async function fetchDiaries() {
  loading.value = true
  try {
    await diaryStore.fetchDiaries(buildQuery())
    syncListState()
  } finally {
    hasFetched.value = true
    loading.value = false
  }
}

async function setTag(tag: string) {
  currentTag.value = tag
  diaryStore.resetList()
  await fetchDiaries()
}

async function loadMore() {
  if (hasMore.value && !loading.value) {
    await diaryStore.loadMore()
    syncListState()
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/diary/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/diary/create' })
}

function likeDiary(id: number) {
  diaryStore.likeDiary(id)
  const index = diaries.value.findIndex(d => d.id === id)
  if (index !== -1) {
    const diary = diaries.value[index]
    diary.isLiked = !diary.isLiked
    diary.likes += diary.isLiked ? 1 : -1
  }
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}天前`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours}小时前`
  const minutes = Math.floor(diff / (1000 * 60))
  return `${minutes}分钟前`
}

function getMoodEmoji(mood: string) {
  const map: Record<string, string> = {
    happy: '😊',
    excited: '🤩',
    calm: '😌',
    tired: '😫',
    neutral: '😐',
  }
  return map[mood] || '😐'
}
</script>

<style lang="scss" scoped>
.diary-list-page {
  min-height: 100vh;
  background: #0A0A1A;
}

/* 标签筛选 */
.filter-tabs {
  display: flex;
  background: rgba(28, 28, 54, 0.8);
  padding: 20rpx 24rpx;
  gap: 12rpx;
  overflow-x: auto;
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.6);
}

.tab-item {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  font-size: 26rpx;
  border-radius: 24rpx;
  background: transparent;
  color: #8888AA;
  white-space: nowrap;
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #FF6B35, #FF2D78);
    color: #FFFFFF;
    font-weight: 600;
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.4), 0 0 30rpx rgba(255, 45, 120, 0.2);
  }
}

/* 日记列表 */
.diary-list {
  height: calc(100vh - 120rpx);
  padding: 24rpx;
}

.diary-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  transition: all 0.3s ease;

  &:active {
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 0 0 20rpx rgba(0, 212, 255, 0.15), 0 0 40rpx rgba(0, 212, 255, 0.05);
  }
}

.diary-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 2rpx solid rgba(0, 212, 255, 0.4);
  transition: all 0.3s ease;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 6rpx;
}

.diary-meta-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.diary-time {
  font-size: 22rpx;
  color: #8888AA;
}

.diary-tag {
  font-size: 20rpx;
}

.diary-mood {
  font-size: 40rpx;
}

.diary-body {
  margin-bottom: 16rpx;
}

.diary-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 12rpx;
  line-height: 1.4;
  letter-spacing: 1rpx;
}

.diary-content {
  font-size: 28rpx;
  color: #8888AA;
  line-height: 1.6;
  display: block;
}

/* 图片 */
.diary-images {
  white-space: nowrap;
  margin-bottom: 16rpx;
}

.diary-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  margin-right: 12rpx;
  display: inline-block;
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  transition: all 0.3s ease;
}

.more-images {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  background: rgba(10, 10, 26, 0.7);
  border: 1rpx solid rgba(42, 42, 74, 0.6);

  text {
    font-size: 32rpx;
    font-weight: 600;
    color: #00D4FF;
  }
}

/* 元信息 */
.diary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  font-size: 24rpx;
  color: #8888AA;
  margin-bottom: 16rpx;
}

.meta-icon {
  display: flex;
  align-items: center;
  color: #8888AA;
}

/* 统计 */
.diary-footer {
  display: flex;
  gap: 48rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(42, 42, 74, 0.6);
}

.stat-item {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.stat-text {
  font-size: 26rpx;
  color: #8888AA;
  transition: all 0.3s ease;
}

/* 标签 */
.tag {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
  border: 1rpx solid rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  color: #8888AA;
  font-size: 26rpx;

  text {
    margin-left: 12rpx;
  }
}

.loading-dot {
  width: 20rpx;
  height: 20rpx;
  background: #00D4FF;
  border-radius: 50%;
  animation: loading 1s infinite;
  box-shadow: 0 0 10rpx rgba(0, 212, 255, 0.5);
}

@keyframes loading {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.no-more {
  text-align: center;
  padding: 40rpx;
  color: #3A3A5A;
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
  color: #555577;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #555577;
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
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  animation: fab-glow 2s ease-in-out infinite;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

@keyframes fab-glow {
  0%, 100% {
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4), 0 0 20rpx rgba(255, 45, 120, 0.2);
  }
  50% {
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.6), 0 0 40rpx rgba(255, 45, 120, 0.4);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
}
</style>
