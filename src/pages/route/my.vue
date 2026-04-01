<template>
  <view class="my-route-page">
    <view class="header">
      <text class="header-title">我的路线</text>
      <text class="header-subtitle">集中管理自建路线、收藏方案与最近编辑记录。</text>
    </view>

    <view v-if="!userStore.isLoggedIn" class="empty-card">
      <text class="empty-title">登录后查看你的路线</text>
      <text class="empty-desc">创建的路线会同步到个人中心，方便再次编辑或分享。</text>
      <button class="create-btn" @click="goLogin">去登录</button>
    </view>

    <template v-else>
      <view class="route-card" v-for="route in myRoutes" :key="route.id" @click="goDetail(route.id)">
        <view class="card-row">
          <view>
            <text class="route-name">{{ route.name }}</text>
            <text class="route-meta">{{ route.distance }}km · {{ formatDate(route.updatedAt) }}</text>
          </view>
          <view class="status">{{ getDifficultyText(route.difficulty) }}</view>
        </view>
        <text class="route-desc">{{ route.description || '暂无路线说明' }}</text>
      </view>

      <view v-if="!loading && !myRoutes.length" class="empty-card">
        <text class="empty-title">还没有发布路线</text>
        <text class="empty-desc">从一条熟悉的短途路线开始整理吧。</text>
      </view>

      <button class="create-btn" @click="goCreate">新建路线</button>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRouteStore, useUserStore } from '@/store'

const routeStore = useRouteStore()
const userStore = useUserStore()
const loading = ref(false)

const myRoutes = computed(() => {
  const userId = userStore.userInfo?.id
  if (!userId) return []
  return routeStore.routes.filter((item) => item.creatorId === userId || item.creator?.id === userId)
})

onShow(() => {
  if (userStore.isLoggedIn) {
    loadRoutes()
  }
})

async function loadRoutes() {
  loading.value = true
  try {
    routeStore.resetList()
    await routeStore.fetchRoutes()
  } catch (error) {
    console.error('加载我的路线失败:', error)
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/route/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/route/create' })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  }
  return map[difficulty] || difficulty
}

function formatDate(value?: string) {
  if (!value) return '刚刚更新'
  const date = new Date(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style lang="scss" scoped>
.my-route-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}

.header {
  margin-bottom: 24rpx;
}

.header-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

.header-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #8888AA;
  line-height: 1.7;
}

.route-card,
.empty-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  transition: all 0.3s ease;
}

.route-card:active {
  transform: scale(0.98);
}

.card-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  align-items: flex-start;
}

.route-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.route-meta,
.route-desc,
.empty-desc {
  display: block;
  font-size: 24rpx;
  color: #8888AA;
  margin-top: 10rpx;
  line-height: 1.7;
}

.status {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 53, 0.15);
  color: #FF6B35;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 0 12rpx rgba(255, 107, 53, 0.3);
  border: 1rpx solid rgba(255, 107, 53, 0.3);
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.create-btn {
  margin-top: 20rpx;
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;
  border: none;

  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }

  &::after {
    display: none;
  }
}
</style>
