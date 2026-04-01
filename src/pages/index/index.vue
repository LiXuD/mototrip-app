<template>
  <view class="index-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索路线、目的地" 
          placeholder-class="search-placeholder"
          @focus="goSearch" 
        />
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-wrapper">
      <swiper 
        class="banner" 
        indicator-dots 
        indicator-color="rgba(255,255,255,0.3)" 
        indicator-active-color="#FFFFFF" 
        autoplay 
        :interval="4000" 
        :duration="600"
        circular
        @change="onBannerChange"
      >
        <swiper-item v-for="(item, index) in banners" :key="index">
          <view class="banner-item" :class="{ 'banner-active': currentBanner === index }">
            <image class="banner-image" :src="item.image" mode="aspectFill" />
            <view class="banner-overlay"></view>
            <view class="banner-content">
              <text class="banner-tag">{{ item.tag }}</text>
              <text class="banner-title">{{ item.title }}</text>
              <text class="banner-subtitle" v-if="item.subtitle">{{ item.subtitle }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 功能入口 -->
    <view class="nav-section">
      <view class="nav-grid">
        <view class="nav-item" @click="goPage('/pages/route/list')">
          <view class="nav-icon-wrapper primary">
            <text class="nav-icon">🗺️</text>
          </view>
          <text class="nav-text">路线</text>
        </view>
        <view class="nav-item" @click="goPage('/pages/trip/list')">
          <view class="nav-icon-wrapper warning">
            <text class="nav-icon">🏍️</text>
          </view>
          <text class="nav-text">行程</text>
        </view>
        <view class="nav-item" @click="goPage('/pages/waypoint/list')">
          <view class="nav-icon-wrapper success">
            <text class="nav-icon">📍</text>
          </view>
          <text class="nav-text">途点</text>
        </view>
        <view class="nav-item" @click="goPage('/pages/preparation/list')">
          <view class="nav-icon-wrapper info">
            <text class="nav-icon">🎒</text>
          </view>
          <text class="nav-text">整备</text>
        </view>
      </view>
      
      <!-- 快捷入口 -->
      <view class="quick-actions">
        <view class="quick-item" @click="goPage('/pages/map/offline')">
          <text class="quick-icon">📥</text>
          <text class="quick-text">离线地图</text>
        </view>
        <view class="quick-item" @click="goPage('/pages/safety/danger-report')">
          <text class="quick-icon">⚠️</text>
          <text class="quick-text">上报危险</text>
        </view>
        <view class="quick-item" @click="goPage('/pages/team/index')">
          <text class="quick-icon">👥</text>
          <text class="quick-text">组队出行</text>
        </view>
        <view class="quick-item" @click="goPage('/pages/footprint/index')">
          <text class="quick-icon">👣</text>
          <text class="quick-text">足迹</text>
        </view>
      </view>
    </view>

    <!-- 热门路线 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrapper">
          <text class="section-icon">🔥</text>
          <text class="section-title">热门路线</text>
        </view>
        <view class="section-more" @click="goPage('/pages/route/list')">
          <text>查看更多</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <scroll-view class="route-scroll" scroll-x enhanced :show-scrollbar="false">
        <view class="route-card" v-for="route in hotRoutes" :key="route.id" @click="goRouteDetail(route.id)">
          <view class="route-cover-wrapper">
            <image class="route-cover" :src="route.coverImage || '/static/default.png'" mode="aspectFill" />
            <view class="route-distance-tag" v-if="route.distance">
              <text>{{ route.distance }}km</text>
            </view>
          </view>
          <view class="route-info">
            <text class="route-name ellipsis">{{ route.name }}</text>
            <view class="route-meta">
              <text class="route-location" v-if="route.startPoint">📍 {{ route.startPoint }}</text>
            </view>
          </view>
        </view>
        <!-- 空状态 -->
        <view class="route-empty" v-if="hotRoutes.length === 0">
          <text class="empty-icon">🛣️</text>
          <text class="empty-text">暂无热门路线</text>
        </view>
      </scroll-view>
    </view>

    <!-- 最新日记 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrapper">
          <text class="section-icon">📖</text>
          <text class="section-title">最新日记</text>
        </view>
        <view class="section-more" @click="goPage('/pages/diary/list')">
          <text>查看更多</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="diary-list">
        <view class="diary-card" v-for="diary in latestDiaries" :key="diary.id" @click="goDiaryDetail(diary.id)">
          <view class="diary-header">
            <image class="diary-avatar" :src="diary.user?.avatar || '/static/avatar.png'" />
            <view class="diary-user-info">
              <text class="diary-author">{{ diary.user?.nickname || '匿名用户' }}</text>
              <text class="diary-time">{{ formatTime(diary.createdAt) }}</text>
            </view>
          </view>
          <view class="diary-body">
            <text class="diary-title ellipsis-2">{{ diary.title }}</text>
            <text class="diary-content ellipsis-2" v-if="diary.content">{{ diary.content }}</text>
          </view>
          <view class="diary-footer">
            <view class="diary-stats">
              <text class="stat-item">❤️ {{ diary.likes || 0 }}</text>
              <text class="stat-item">💬 {{ diary.comments || 0 }}</text>
            </view>
            <text class="diary-tag tag tag-primary" v-if="diary.tag">{{ diary.tag }}</text>
          </view>
        </view>
        <!-- 空状态 -->
        <view class="diary-empty" v-if="latestDiaries.length === 0">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无日记，快去发布吧</text>
        </view>
      </view>
    </view>
    
    <!-- 底部占位 -->
    <view class="bottom-space"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { routeApi, diaryApi } from '@/services/api'

interface Banner {
  image: string
  link?: string
  title: string
  subtitle?: string
  tag: string
}

interface HotRoute {
  id: number
  name: string
  coverImage?: string
  distance: number
  startPoint?: string
}

interface LatestDiary {
  id: number
  title: string
  content: string
  createdAt: string
  likes: number
  comments: number
  tag?: string
  user?: {
    nickname: string
    avatar?: string
  }
}

const banners = ref<Banner[]>([
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    title: '自由骑行，感受风的温度',
    subtitle: '开启你的摩旅之旅',
    tag: '摩旅推荐',
  },
  {
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80',
    title: '山川湖海，皆在轮下',
    subtitle: '探索未知，发现更美的风景',
    tag: '路线精选',
  },
  {
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',
    title: '安全出行，平安归来',
    subtitle: '组队出行，让旅途更安心',
    tag: '安全出行',
  },
])

const currentBanner = ref(0)

const hotRoutes = ref<HotRoute[]>([])
const latestDiaries = ref<LatestDiary[]>([])

onMounted(() => {
  fetchData()
})

async function fetchData() {
  try {
    // 获取热门路线
    const routeRes = await routeApi.list({ pageSize: 5 })
    hotRoutes.value = (routeRes.list || []) as HotRoute[]
    
    // 获取最新日记
    const diaryRes = await diaryApi.list({ pageSize: 5 })
    latestDiaries.value = (diaryRes as unknown as { list: LatestDiary[] }).list || []
  } catch (error) {
    console.error('获取首页数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
}

function goPage(url: string) {
  uni.navigateTo({ url })
}

function goRouteDetail(id: number) {
  uni.navigateTo({ url: `/pages/route/detail?id=${id}` })
}

function goDiaryDetail(id: number) {
  uni.navigateTo({ url: `/pages/diary/detail?id=${id}` })
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
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

function onBannerChange(e: { detail: { current: number } }) {
  currentBanner.value = e.detail.current
}
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: #0A0A1A;
}

/* 搜索栏 - 毛玻璃效果 */
.search-bar {
  padding: 24rpx 32rpx;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.5);
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  border-radius: 28rpx;
  padding: 16rpx 24rpx;
  height: 88rpx;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: rgba(255, 107, 53, 0.5);
    box-shadow: 0 0 20rpx rgba(255, 107, 53, 0.15);
  }
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
}

.search-placeholder {
  color: #555577;
  font-size: 28rpx;
}

/* 轮播图 */
.banner-wrapper {
  padding: 20rpx 20rpx 0;
}

.banner {
  height: 400rpx;
  border-radius: 28rpx;
  overflow: hidden;
  border: 1rpx solid rgba(42, 42, 74, 0.5);
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28rpx;
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.banner-active {
    transform: scale(1);
  }
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 26, 0.2) 0%,
    rgba(10, 10, 26, 0.4) 40%,
    rgba(10, 10, 26, 0.85) 100%
  );
}

.banner-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 36rpx 32rpx;
}

.banner-tag {
  display: inline-block;
  background: linear-gradient(135deg, #FF6B35 0%, #FF2D78 100%);
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 700;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 0 20rpx rgba(255, 107, 53, 0.3);
}

.banner-title {
  display: block;
  font-size: 38rpx;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.3;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.5);
  margin-bottom: 10rpx;
  letter-spacing: 2rpx;
}

.banner-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  letter-spacing: 1rpx;
}

/* 功能导航 - 毛玻璃卡片 */
.nav-section {
  background: rgba(28, 28, 54, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  margin: 24rpx 20rpx;
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(42, 42, 74, 0.5);
}

.nav-grid {
  display: flex;
  justify-content: space-around;
  margin-bottom: 36rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:active {
    transform: scale(0.92);
  }
}

.nav-icon-wrapper {
  width: 112rpx;
  height: 112rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #FF6B35 0%, #FF2D78 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.35);
  }
  &.warning {
    background: linear-gradient(135deg, #FFD600 0%, #FF6B35 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 214, 0, 0.25);
  }
  &.success {
    background: linear-gradient(135deg, #00FF88 0%, #00D4FF 100%);
    box-shadow: 0 8rpx 24rpx rgba(0, 255, 136, 0.25);
  }
  &.info {
    background: linear-gradient(135deg, #00D4FF 0%, #7B2FFF 100%);
    box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.25);
  }
}

.nav-icon {
  font-size: 48rpx;
}

.nav-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 600;
  letter-spacing: 1rpx;
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 28rpx;
  border-top: 1rpx solid rgba(42, 42, 74, 0.5);
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:active {
    transform: scale(0.9);
  }
}

.quick-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.quick-text {
  font-size: 24rpx;
  color: #8888AA;
  font-weight: 500;
}

/* 区块 */
.section {
  background: rgba(28, 28, 54, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  margin: 0 20rpx 24rpx;
  padding: 32rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(42, 42, 74, 0.5);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
}

.section-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

.section-more {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #00D4FF;
  font-weight: 500;
  transition: all 0.3s ease;

  &:active {
    opacity: 0.7;
  }

  .arrow {
    margin-left: 4rpx;
    font-size: 32rpx;
  }
}

/* 路线卡片 - 深色毛玻璃 */
.route-scroll {
  white-space: nowrap;
  margin: 0 -32rpx;
  padding: 0 32rpx;
}

.route-card {
  display: inline-block;
  width: 260rpx;
  margin-right: 20rpx;
  vertical-align: top;
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
    border-color: rgba(255, 107, 53, 0.4);
    box-shadow: 0 0 20rpx rgba(255, 107, 53, 0.15);
  }

  &:last-child {
    margin-right: 0;
  }
}

.route-cover-wrapper {
  position: relative;
  width: 100%;
  height: 160rpx;
}

.route-cover {
  width: 100%;
  height: 100%;
}

.route-distance-tag {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  background: rgba(10, 10, 26, 0.7);
  backdrop-filter: blur(10px);
  color: #00D4FF;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  border: 1rpx solid rgba(0, 212, 255, 0.3);
}

.route-info {
  padding: 16rpx;
}

.route-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.route-meta {
  display: flex;
  align-items: center;
}

.route-location {
  font-size: 22rpx;
  color: #8888AA;
}

.route-empty {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 260rpx;
  height: 200rpx;
  background: rgba(28, 28, 54, 0.5);
  border-radius: 24rpx;
  vertical-align: top;
  border: 1rpx dashed rgba(42, 42, 74, 0.8);
}

.empty-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #555577;
}

/* 日记卡片 - 深色发光边框 */
.diary-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.diary-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  transition: all 0.3s ease;

  &:active {
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 20rpx rgba(0, 212, 255, 0.1);
    transform: scale(0.98);
  }
}

.diary-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.diary-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 2rpx solid rgba(255, 107, 53, 0.4);
}

.diary-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.diary-author {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}

.diary-time {
  font-size: 22rpx;
  color: #555577;
  margin-top: 4rpx;
}

.diary-body {
  margin-bottom: 16rpx;
}

.diary-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
  letter-spacing: 1rpx;
}

.diary-content {
  font-size: 26rpx;
  color: #8888AA;
  display: block;
  line-height: 1.5;
}

.diary-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diary-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #8888AA;
}

.diary-tag.tag.tag-primary {
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
  border: 1rpx solid rgba(255, 107, 53, 0.3);
}

.diary-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.bottom-space {
  height: 40rpx;
}
</style>
