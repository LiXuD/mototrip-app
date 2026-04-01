<template>
  <view class="social-page">
    <!-- 标签页 -->
    <view class="tabs">
      <view class="tab" :class="{ active: currentTab === 'follow' }" @click="currentTab = 'follow'">
        关注
      </view>
      <view class="tab" :class="{ active: currentTab === 'hot' }" @click="currentTab = 'hot'">
        热门
      </view>
      <view class="tab" :class="{ active: currentTab === 'nearby' }" @click="currentTab = 'nearby'">
        附近
      </view>
    </view>

    <!-- 动态列表 -->
    <scroll-view class="feed-list" scroll-y @scrolltolower="loadMore">
      <view class="post-card" v-for="post in posts" :key="post.id">
        <!-- 用户信息 -->
        <view class="post-header">
          <image class="user-avatar" :src="post.user?.avatar || '/static/avatar.png'" />
          <view class="user-info">
            <text class="user-name">{{ post.user?.nickname }}</text>
            <text class="post-time">{{ formatTime(post.createdAt) }}</text>
          </view>
        </view>

        <!-- 内容 -->
        <text class="post-content">{{ post.content }}</text>

        <!-- 图片 -->
        <view class="post-images" v-if="post.images && post.images.length > 0">
          <image 
            v-for="(img, idx) in post.images" 
            :key="idx" 
            :src="img" 
            mode="aspectFill"
            class="post-img"
            :class="{ 'single-img': post.images.length === 1 }"
            @click="previewImages(post.images!, idx)"
          />
        </view>

        <!-- 位置 -->
        <view class="post-location" v-if="post.location">
          <IconSvg name="location" :size="24" color="#999" /> <text>{{ post.location }}</text>
        </view>

        <!-- 互动 -->
        <view class="post-actions">
          <view class="action-item" @click="likePost(post.id)">
            <IconSvg :name="post.isLiked ? 'heart' : 'heart'" :size="32" :color="post.isLiked ? '#FF3B30' : '#999'" />
            <text>{{ post.likes }}</text>
          </view>
          <view class="action-item">
            <IconSvg name="chat" :size="32" color="#999" />
            <text>{{ post.comments }}</text>
          </view>
          <view class="action-item">
            <IconSvg name="share" :size="32" color="#999" />
            <text>{{ post.shares }}</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && posts.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="fab" @click="goPublish">
      <IconSvg name="add" :size="60" color="#FFFFFF" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Post } from '@/types'

const currentTab = ref('follow')
const posts = ref<Post[]>([])
const loading = ref(false)
const hasMore = ref(true)

onMounted(() => {
  fetchPosts()
})

async function fetchPosts() {
  loading.value = true
  try {
    // TODO: 调用 API
    // const res = await postApi.list({ tab: currentTab.value })
    // posts.value = res.list
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (hasMore.value && !loading.value) {
    // TODO: 加载更多
  }
}

function likePost(id: number) {
  // TODO: 调用 API 点赞
}

function goPublish() {
  uni.navigateTo({ url: '/pages/social/publish' })
}

function previewImages(images: string[], index: number) {
  uni.previewImage({
    urls: images,
    current: index,
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}天前`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours}小时前`
  return '刚刚'
}
</script>

<style lang="scss" scoped>
.social-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
  &.active {
    color: #007AFF;
    border-bottom-color: #007AFF;
  }
}

.feed-list {
  height: calc(100vh - 140rpx);
  padding: 20rpx;
}

.post-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.post-time {
  font-size: 22rpx;
  color: #999;
}

.post-content {
  font-size: 28rpx;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.post-img {
  width: calc(33.33% - 6rpx);
  height: 200rpx;
  border-radius: 8rpx;
  &.single-img {
    width: 100%;
    height: 400rpx;
  }
}

.post-location {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.post-actions {
  display: flex;
  gap: 60rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #999;
}

.loading, .no-more {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.4);
}
</style>
