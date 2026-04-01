<template>
  <view class="trip-detail-page">
    <view class="summary" v-if="trip">
      <text class="summary-title">{{ trip.name }}</text>
      <text class="summary-meta">
        {{ formatDateRange(trip.startDate, trip.endDate) }} · {{ trip.totalDistance || 0 }}km · {{ trip.waypoints?.length || 0 }} 个途点
      </text>
      <text class="summary-status">当前状态：{{ getStatusText(trip.status) }}</text>
    </view>

    <view class="card" v-if="trip">
      <text class="section-title">行程安排</text>
      <view v-if="trip.waypoints?.length" v-for="(item, index) in trip.waypoints" :key="item.id || index" class="schedule-item">
        <text class="schedule-day">D{{ index + 1 }}</text>
        <view>
          <text class="schedule-title">{{ item.name }}</text>
          <text class="schedule-desc">{{ item.description || item.location?.name || '待补充途点说明' }}</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-title">暂未添加途点</text>
        <text class="empty-desc">创建行程后可继续补充每日停靠点与住宿计划。</text>
      </view>
    </view>

    <view v-else-if="!loading" class="card empty-state">
      <text class="empty-title">未找到行程</text>
      <text class="empty-desc">请返回行程列表重新选择。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { tripApi } from '@/services/api'
import type { Trip } from '@/types'

const loading = ref(false)
const trip = ref<Trip | null>(null)

onLoad((options) => {
  const id = Number(options?.id || 0)
  if (id) {
    loadTripDetail(id)
  }
})

async function loadTripDetail(id: number) {
  loading.value = true
  try {
    trip.value = await tripApi.getDetail(id) as Trip
  } catch (error) {
    console.error('加载行程详情失败:', error)
    uni.showToast({ title: '行程加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function getStatusText(status?: Trip['status']) {
  const map: Record<string, string> = {
    planning: '计划中',
    ongoing: '进行中',
    completed: '已完成',
  }
  return status ? map[status] || status : '未知'
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate) return '待定日期'

  const format = (value: string) => {
    const date = new Date(value)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return endDate ? `${format(startDate)} - ${format(endDate)}` : format(startDate)
}
</script>

<style lang="scss" scoped>
.trip-detail-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}

.summary {
  background: linear-gradient(135deg, #00D4FF, #7B2FFF);
  color: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 212, 255, 0.3);
}

.summary-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  margin-bottom: 14rpx;
  letter-spacing: 2rpx;
}

.summary-meta,
.summary-status {
  display: block;
  font-size: 26rpx;
  line-height: 1.7;
  opacity: 0.9;
}

.card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 18rpx;
  letter-spacing: 1rpx;
}

.schedule-item {
  display: flex;
  gap: 20rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid rgba(42, 42, 74, 0.6);
  transition: all 0.3s ease;
}

.schedule-item:first-of-type {
  border-top: none;
}

.schedule-day {
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  border-radius: 50%;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.4);
  flex-shrink: 0;
}

.schedule-title {
  display: block;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.schedule-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8888AA;
  line-height: 1.7;
}

.empty-state {
  padding: 36rpx 12rpx;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #8888AA;
  line-height: 1.7;
}
</style>
