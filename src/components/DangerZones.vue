<template>
  <view class="danger-zones-container">
    <!-- 危险路段列表 -->
    <view class="danger-list" v-if="zones.length > 0">
      <view 
        class="danger-item" 
        v-for="(zone, index) in zones" 
        :key="zone.id ?? `danger-${index}`"
        :class="'severity-' + zone.severity"
        @click="handleClick(zone)"
      >
        <view class="danger-icon">
          {{ getTypeIcon(zone.type) }}
        </view>
        <view class="danger-info">
          <text class="danger-name">{{ zone.name }}</text>
          <text class="danger-type">{{ getTypeText(zone.type) }}</text>
          <text class="danger-distance" v-if="zone.distance !== undefined">
            距离 {{ formatDistance(zone.distance) }}
          </text>
        </view>
        <view class="severity-badge" :class="'severity-' + zone.severity">
          {{ getSeverityText(zone.severity) }}
        </view>
      </view>
    </view>
    
    <!-- 禁停区域列表 -->
    <view class="no-parking-list" v-if="noParkingZones.length > 0">
      <view 
        class="no-parking-item" 
        v-for="zone in noParkingZones" 
        :key="'np-' + zone.id"
        @click="handleNoParkingClick(zone)"
      >
        <view class="no-parking-icon">🚫</view>
        <view class="no-parking-info">
          <text class="no-parking-name">{{ zone.name }}</text>
          <text class="no-parking-reason" v-if="zone.reason">{{ zone.reason }}</text>
          <text class="no-parking-distance" v-if="zone.distance !== undefined">
            距离 {{ formatDistance(zone.distance) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DangerZone, DangerWarning, NoParkingZone, NoParkingWarning, DangerType, DangerSeverity } from '@/types'

interface Props {
  zones: (DangerZone | DangerWarning)[]
  noParkingZones: (NoParkingZone | NoParkingWarning)[]
}

defineProps<Props>()

const emit = defineEmits<{
  zoneClick: [zone: DangerZone | DangerWarning]
  noParkingClick: [zone: NoParkingZone | NoParkingWarning]
}>()

function getTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    landslide: '⛰️',
    falling_rocks: '🪨',
    steep_slope: '📐',
    sharp_turn: '↩️',
    water_side: '🌊',
    cliff_side: '🏔️',
    ice_snow: '❄️',
    flood: '🌧️',
    construction: '🚧',
    other: '⚠️',
  }
  return iconMap[type] || '⚠️'
}

function getTypeText(type: string): string {
  const textMap: Record<string, string> = {
    landslide: '滑坡风险',
    falling_rocks: '落石风险',
    steep_slope: '陡坡',
    sharp_turn: '急弯',
    water_side: '临水路段',
    cliff_side: '临崖路段',
    ice_snow: '结冰积雪',
    flood: '积水/洪水',
    construction: '施工路段',
    other: '其他危险',
  }
  return textMap[type] || type
}

function getSeverityText(severity: string): string {
  const textMap: Record<string, string> = {
    light: '轻微',
    medium: '中等',
    severe: '严重',
  }
  return textMap[severity] || severity
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + 'km'
  }
  return Math.round(meters) + 'm'
}

function handleClick(zone: DangerZone | DangerWarning) {
  emit('zoneClick', zone)
}

function handleNoParkingClick(zone: NoParkingZone | NoParkingWarning) {
  emit('noParkingClick', zone)
}
</script>

<style lang="scss" scoped>
.danger-zones-container {
  padding: 20rpx;
}

.danger-list, .no-parking-list {
  margin-bottom: 20rpx;
}

.danger-item, .no-parking-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid;
}

.danger-item {
  border-left-color: #ff9800;
  
  &.severity-severe {
    border-left-color: #f44336;
    background: #fff5f5;
  }
  
  &.severity-medium {
    border-left-color: #ff9800;
  }
  
  &.severity-light {
    border-left-color: #4caf50;
  }
}

.no-parking-item {
  border-left-color: #9e9e9e;
}

.danger-icon, .no-parking-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.danger-info, .no-parking-info {
  flex: 1;
}

.danger-name, .no-parking-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.danger-type, .no-parking-reason {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.danger-distance, .no-parking-distance {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.severity-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  
  &.severity-severe {
    background: #ffebee;
    color: #f44336;
  }
  
  &.severity-medium {
    background: #fff3e0;
    color: #ff9800;
  }
  
  &.severity-light {
    background: #e8f5e9;
    color: #4caf50;
  }
}
</style>
