<template>
  <view class="danger-report-page">
    <view class="form-container">
      <!-- 位置选择 -->
      <view class="form-item">
        <text class="label">位置 *</text>
        <view class="location-selector" @click="selectLocation">
          <text v-if="form.location.lat">{{ form.location.lat.toFixed(4) }}, {{ form.location.lng.toFixed(4) }}</text>
          <text v-else class="placeholder">点击选择位置</text>
        </view>
      </view>

      <!-- 名称 -->
      <view class="form-item">
        <text class="label">名称 *</text>
        <input class="input" v-model="form.name" placeholder="请输入危险路段名称" />
      </view>

      <!-- 类型 -->
      <view class="form-item">
        <text class="label">危险类型 *</text>
        <view class="type-selector">
          <view 
            v-for="t in dangerTypes" 
            :key="t.value"
            class="type-option"
            :class="{ active: form.type === t.value }"
            @click="form.type = t.value"
          >
            <text class="type-icon">{{ t.icon }}</text>
            <text class="type-text">{{ t.label }}</text>
          </view>
        </view>
      </view>

      <!-- 严重程度 -->
      <view class="form-item">
        <text class="label">严重程度 *</text>
        <view class="severity-selector">
          <view 
            v-for="s in severityOptions" 
            :key="s.value"
            class="severity-option"
            :class="{ active: form.severity === s.value, [s.value]: true }"
            @click="form.severity = s.value"
          >
            {{ s.label }}
          </view>
        </view>
      </view>

      <!-- 描述 -->
      <view class="form-item">
        <text class="label">详细描述</text>
        <textarea class="textarea" v-model="form.description" placeholder="请描述具体情况..." />
      </view>

      <!-- 影响范围 -->
      <view class="form-item">
        <text class="label">影响范围 (米)</text>
        <slider 
          v-model="form.radius" 
          min="100" 
          max="2000" 
          step="100"
          show-value
        />
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="handleSubmit" :disabled="!canSubmit">
        提交上报
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { dangerZoneApi } from '@/services/api'
import type { DangerType, DangerSeverity, GeoPoint } from '@/types'

const form = ref({
  name: '',
  description: '',
  location: { lat: 0, lng: 0 } as GeoPoint,
  radius: 500,
  type: 'other' as DangerType,
  severity: 'medium' as DangerSeverity,
})

const dangerTypes = [
  { value: 'landslide', label: '滑坡', icon: '⛰️' },
  { value: 'falling_rocks', label: '落石', icon: '🪨' },
  { value: 'steep_slope', label: '陡坡', icon: '📐' },
  { value: 'sharp_turn', label: '急弯', icon: '↩️' },
  { value: 'water_side', label: '临水', icon: '🌊' },
  { value: 'cliff_side', label: '临崖', icon: '🏔️' },
  { value: 'ice_snow', label: '结冰', icon: '❄️' },
  { value: 'flood', label: '积水', icon: '🌧️' },
  { value: 'construction', label: '施工', icon: '🚧' },
  { value: 'other', label: '其他', icon: '⚠️' },
] as const

const severityOptions = [
  { value: 'light', label: '轻微' },
  { value: 'medium', label: '中等' },
  { value: 'severe', label: '严重' },
] as const

const canSubmit = computed(() => {
  return form.value.name && form.value.location.lat && form.value.type && form.value.severity
})

function selectLocation() {
  uni.chooseLocation({
    success: (res) => {
      if (res.latitude && res.longitude) {
        form.value.location = {
          lat: res.latitude,
          lng: res.longitude,
        }
      }
    },
    fail: () => {
      // 如果失败，尝试使用当前位置
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          form.value.location = {
            lat: res.latitude,
            lng: res.longitude,
          }
        },
      })
    },
  })
}

async function handleSubmit() {
  if (!canSubmit.value) return

  try {
    uni.showLoading({ title: '提交中...' })
    await dangerZoneApi.create({
      name: form.value.name,
      description: form.value.description,
      location: form.value.location,
      radius: form.value.radius,
      type: form.value.type,
      severity: form.value.severity,
    })
    uni.hideLoading()
    uni.showToast({ title: '上报成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '上报失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.danger-report-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.form-container {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
  color: #333;
}

.input {
  width: 100%;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.location-selector {
  padding: 20rpx;
  border: 1px dashed #007AFF;
  border-radius: 8rpx;
  text-align: center;
  color: #007AFF;
  
  .placeholder {
    color: #999;
  }
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  
  &.active {
    border-color: #007AFF;
    background: #e3f2fd;
  }
}

.type-icon {
  font-size: 36rpx;
}

.type-text {
  font-size: 22rpx;
  margin-top: 4rpx;
}

.severity-selector {
  display: flex;
  gap: 16rpx;
}

.severity-option {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: 1px solid #e0e0e0;
  
  &.active {
    &.light { background: #e8f5e9; border-color: #4caf50; color: #4caf50; }
    &.medium { background: #fff3e0; border-color: #ff9800; color: #ff9800; }
    &.severe { background: #ffebee; border-color: #f44336; color: #f44336; }
  }
}

.textarea {
  width: 100%;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 150rpx;
}

.submit-btn {
  width: 100%;
  padding: 24rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  
  &[disabled] {
    background: #ccc;
  }
}
</style>
