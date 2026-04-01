<template>
  <view class="waypoint-page">
    <view class="hero">
      <text class="hero-title">沿途推荐途点</text>
      <text class="hero-subtitle">筛选加油、补给、住宿与风景点，规划更顺畅的摩旅路线。</text>
    </view>

    <view class="filter-row">
      <view
        v-for="item in filters"
        :key="item.value"
        class="filter-chip"
        :class="{ active: currentFilter === item.value }"
        @click="currentFilter = item.value"
      >
        {{ item.label }}
      </view>
    </view>

    <view class="waypoint-list">
      <view v-for="waypoint in filteredWaypoints" :key="waypoint.id" class="waypoint-card">
        <view class="card-top">
          <view>
            <text class="waypoint-name">{{ waypoint.name }}</text>
            <text class="waypoint-desc">{{ waypoint.description }}</text>
          </view>
          <view class="type-badge">{{ waypoint.typeLabel }}</view>
        </view>
        <view class="meta-row">
          <view style="display: flex; align-items: center">
            <IconSvg name="location" :size="24" color="#8E8E93" style="margin-right: 4rpx" />
            <text>{{ waypoint.location }}</text>
          </view>
          <view style="display: flex; align-items: center">
            <text>⭐ {{ waypoint.rating }}</text>
          </view>
        </view>
        <view class="meta-row">
          <view style="display: flex; align-items: center">
            <IconSvg name="clock" :size="24" color="#8E8E93" style="margin-right: 4rpx" />
            <text>{{ waypoint.hours }}</text>
          </view>
          <view style="display: flex; align-items: center">
            <IconSvg name="phone" :size="24" color="#8E8E93" style="margin-right: 4rpx" />
            <text>{{ waypoint.phone }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { waypointApi } from '@/services/api'
import type { Waypoint } from '@/types'

const filters = [
  { label: '全部', value: 'all' },
  { label: '风景', value: 'scenic' },
  { label: '加油', value: 'gas' },
  { label: '住宿', value: 'hotel' },
  { label: '维修', value: 'repair' },
]

const currentFilter = ref('all')
const seedWaypoints = [
  { id: 1, name: '洱海观景台', description: '适合日出拍照与短暂停靠。', type: 'scenic', typeLabel: '风景', location: '大理海东镇', rating: 4.8, hours: '全天开放', phone: '—' },
  { id: 2, name: '怒江补给站', description: '提供 95 号汽油与热食补给。', type: 'gas', typeLabel: '加油', location: '六库服务区', rating: 4.5, hours: '06:00 - 23:00', phone: '0886-2336677' },
  { id: 3, name: '骑士驿站', description: '摩友常驻落脚点，可代收快递。', type: 'hotel', typeLabel: '住宿', location: '香格里拉独克宗', rating: 4.7, hours: '24 小时', phone: '13900001111' },
  { id: 4, name: '高原机修点', description: '支持轮胎补胎、链条保养与基础检修。', type: 'repair', typeLabel: '维修', location: '奔子栏镇', rating: 4.6, hours: '08:30 - 20:30', phone: '13900002222' },
]
const waypoints = ref(seedWaypoints)

watch(currentFilter, () => {
  loadWaypoints()
}, { immediate: true })

const filteredWaypoints = computed(() => {
  return waypoints.value.map((item) => ({
    ...item,
    typeLabel: filters.find((filter) => filter.value === item.type)?.label || '其他',
  }))
})

async function loadWaypoints() {
  try {
    const data = await waypointApi.list({
      type: currentFilter.value === 'all' ? undefined : currentFilter.value,
    }) as Waypoint[]

    if (Array.isArray(data) && data.length) {
      waypoints.value = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '待补充介绍',
        type: item.type,
        typeLabel: filters.find((filter) => filter.value === item.type)?.label || '其他',
        location: item.location?.name || `${item.location?.lat || 0}, ${item.location?.lng || 0}`,
        rating: item.rating || 0,
        hours: item.openingHours || '时间待补充',
        phone: item.phone || '—',
      }))
      return
    }
  } catch (error) {
    console.error('加载途点列表失败:', error)
  }

  waypoints.value = currentFilter.value === 'all'
    ? seedWaypoints
    : seedWaypoints.filter((item) => item.type === currentFilter.value)
}
</script>

<style lang="scss" scoped>
.waypoint-page { min-height: 100vh; background: #f2f2f7; padding: 24rpx; }
.hero { background: linear-gradient(135deg, #ff9a62, #ff6b35); border-radius: 28rpx; padding: 32rpx; color: #fff; margin-bottom: 24rpx; }
.hero-title { display: block; font-size: 40rpx; font-weight: 700; margin-bottom: 12rpx; }
.hero-subtitle { display: block; font-size: 26rpx; line-height: 1.6; opacity: 0.92; }
.filter-row { display: flex; gap: 16rpx; overflow-x: auto; margin-bottom: 24rpx; }
.filter-chip { flex-shrink: 0; padding: 14rpx 28rpx; border-radius: 999rpx; background: #fff; color: #666; font-size: 26rpx; }
.filter-chip.active { background: #1a1a2e; color: #fff; }
.waypoint-card { background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05); }
.card-top { display: flex; justify-content: space-between; gap: 20rpx; margin-bottom: 16rpx; }
.waypoint-name { display: block; font-size: 32rpx; font-weight: 600; color: #1a1a2e; margin-bottom: 8rpx; }
.waypoint-desc { display: block; color: #666; font-size: 25rpx; line-height: 1.6; }
.type-badge { align-self: flex-start; background: #fff1eb; color: #ff6b35; padding: 8rpx 20rpx; border-radius: 999rpx; font-size: 24rpx; }
.meta-row { display: flex; justify-content: space-between; color: #8e8e93; font-size: 24rpx; margin-top: 12rpx; gap: 20rpx; }
</style>
