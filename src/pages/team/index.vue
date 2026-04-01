<template>
  <view class="team-list-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filter === 'all' }" 
        @click="setFilter('all')"
      >
        全部
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'open' }" 
        @click="setFilter('open')"
      >
        <text class="filter-dot open"></text>
        可加入
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'ongoing' }" 
        @click="setFilter('ongoing')"
      >
        <text class="filter-dot ongoing"></text>
        进行中
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'completed' }" 
        @click="setFilter('completed')"
      >
        已完成
      </view>
    </view>

    <!-- 队伍列表 -->
    <scroll-view class="team-list" scroll-y @scrolltolower="loadMore">
      <view class="team-card" v-for="team in teams" :key="team.id" @click="goDetail(team.id)">
        <view class="team-cover-wrapper">
          <image class="team-cover" :src="team.coverImage || '/static/team-default.png'" mode="aspectFill" />
          <view class="team-status-badge" :class="team.status">
            {{ getStatusText(team.status) }}
          </view>
          <view class="team-members-count">
            <text>👥 {{ team.memberCount || 0 }}/{{ team.maxMembers }}</text>
          </view>
        </view>
        <view class="team-body">
          <text class="team-name ellipsis">{{ team.name }}</text>
          <view class="team-route">
            <text class="route-icon">🛣️</text>
            <text class="route-text">{{ team.destination || '未设置目的地' }}</text>
          </view>
          <view class="team-info">
            <view class="info-item">
              <text class="info-icon">🕐</text>
              <text class="info-text">{{ formatTime(team.startTime) }}</text>
            </view>
            <view class="info-item">
              <text class="info-icon">👤</text>
              <text class="info-text">领队: {{ team.creator?.nickname || '未知' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-dot"></view>
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && teams.length > 0">
        <text>— 已经到底了 —</text>
      </view>
      <view class="empty" v-if="teams.length === 0 && !loading">
        <text class="empty-icon">👥</text>
        <text class="empty-text">暂无组队信息</text>
        <text class="empty-hint">快发起第一个组队吧</text>
        <button class="empty-btn" @click="goCreate">创建组队</button>
      </view>
    </scroll-view>

    <!-- 创建按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface Team {
  id: number
  name: string
  coverImage?: string
  status: string
  destination?: string
  startTime?: string
  memberCount?: number
  maxMembers?: number
  creator?: { nickname: string }
}

const teams = ref<Team[]>([])
const loading = ref(false)
const hasMore = ref(true)
const filter = ref('all')
const page = ref(1)

onShow(() => { fetchTeams() })

function setFilter(f: string) {
  filter.value = f
  page.value = 1
  hasMore.value = true
  fetchTeams()
}

async function fetchTeams() {
  loading.value = true
  try {
    const status = filter.value === 'all' ? undefined : filter.value
    const res: any = await uni.request({ url: `/api/teams?page=${page.value}&status=${status}` })
    if (res.data) {
      if (page.value === 1) {
        teams.value = res.data.list || []
      } else {
        teams.value.push(...(res.data.list || []))
      }
      hasMore.value = res.data.hasMore
    }
  } catch (e) { 
    console.error('获取组队列表失败', e) 
    // 使用模拟数据
    teams.value = [
      { id: 1, name: '周末京郊摩旅', status: 'open', destination: '北京-密云', startTime: '2024-03-25', memberCount: 3, maxMembers: 6, creator: { nickname: '老王' } },
      { id: 2, name: '318川藏线之旅', status: 'ongoing', destination: '成都-拉萨', startTime: '2024-03-20', memberCount: 5, maxMembers: 5, creator: { nickname: '阿涛' } },
      { id: 3, name: '摩友聚会', status: 'completed', destination: '北京朝阳公园', startTime: '2024-03-15', memberCount: 10, maxMembers: 20, creator: { nickname: '小李' } },
    ]
    hasMore.value = false
  }
  finally { loading.value = false }
}

function loadMore() {
  if (hasMore.value && !loading.value) { 
    page.value++; 
    fetchTeams() 
  }
}

function goDetail(id: number) { 
  uni.navigateTo({ url: `/pages/team/detail?id=${id}` }) 
}

function goCreate() { 
  uni.navigateTo({ url: '/pages/team/create' }) 
}

function getStatusText(status: string) { 
  const map: Record<string, string> = { 
    open: '可加入', 
    full: '已满员', 
    ongoing: '进行中', 
    completed: '已完成', 
    cancelled: '已取消' 
  }; 
  return map[status] || status 
}

function formatTime(dateStr?: string) { 
  if (!dateStr) return '待定'; 
  const date = new Date(dateStr); 
  return `${date.getMonth() + 1}月${date.getDate()}日` 
}
</script>

<style lang="scss" scoped>
.team-list-page {
  min-height: 100vh;
  background: #0A0A1A;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.6);
  padding: 20rpx 24rpx;
  gap: 12rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 16rpx 0;
  font-size: 26rpx;
  border-radius: 24rpx;
  background: rgba(42, 42, 74, 0.4);
  color: #8888AA;
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #FF6B35, #FF2D78);
    color: #FFFFFF;
    border-color: transparent;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.4);

    .filter-dot {
      background: #FFFFFF;
    }
  }
}

.filter-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  margin-right: 8rpx;

  &.open { background: #00FF88; }
  &.ongoing { background: #FFD600; }
}

/* 队伍列表 */
.team-list {
  height: calc(100vh - 140rpx);
  padding: 24rpx;
}

.team-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.team-cover-wrapper {
  position: relative;
  width: 100%;
  height: 240rpx;
}

.team-cover {
  width: 100%;
  height: 100%;
}

.team-status-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #FFFFFF;
  border-radius: 20rpx;

  &.open {
    background: rgba(0, 255, 136, 0.2);
    color: #00FF88;
    border: 1rpx solid rgba(0, 255, 136, 0.4);
    box-shadow: 0 0 12rpx rgba(0, 255, 136, 0.3);
  }
  &.full {
    background: rgba(255, 214, 0, 0.2);
    color: #FFD600;
    border: 1rpx solid rgba(255, 214, 0, 0.4);
    box-shadow: 0 0 12rpx rgba(255, 214, 0, 0.3);
  }
  &.ongoing {
    background: rgba(255, 107, 53, 0.2);
    color: #FF6B35;
    border: 1rpx solid rgba(255, 107, 53, 0.4);
    box-shadow: 0 0 12rpx rgba(255, 107, 53, 0.3);
  }
  &.completed {
    background: rgba(58, 58, 90, 0.6);
    color: #8888AA;
    border: 1rpx solid rgba(42, 42, 74, 0.6);
  }
}

.team-members-count {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;

  text {
    font-size: 22rpx;
    color: #FFFFFF;
  }
}

.team-body {
  padding: 24rpx;
}

.team-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.team-route {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.route-icon {
  font-size: 26rpx;
  margin-right: 8rpx;
}

.route-text {
  font-size: 26rpx;
  color: #8888AA;
}

.team-info {
  display: flex;
  gap: 24rpx;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.info-text {
  font-size: 24rpx;
  color: #8888AA;
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
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 32rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #FF6B35 0%, #FF2D78 100%);
  color: #FFFFFF;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }

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
  background: linear-gradient(135deg, #FF6B35 0%, #FF2D78 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  animation: fabPulse 2s infinite;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }
}

@keyframes fabPulse {
  0%, 100% { box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4); }
  50% { box-shadow: 0 8rpx 40rpx rgba(255, 107, 53, 0.7); }
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
}
</style>
