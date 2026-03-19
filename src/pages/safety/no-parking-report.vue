<template>
  <view class="no-parking-report-page">
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
        <input class="input" v-model="form.name" placeholder="请输入禁停区域名称" />
      </view>

      <!-- 禁停原因 -->
      <view class="form-item">
        <text class="label">禁停原因 *</text>
        <view class="reason-selector">
          <view 
            v-for="r in reasonOptions" 
            :key="r.value"
            class="reason-option"
            :class="{ active: form.reason === r.value }"
            @click="form.reason = r.value"
          >
            <text class="reason-icon">{{ r.icon }}</text>
            <text class="reason-text">{{ r.label }}</text>
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
          min="50" 
          max="500" 
          step="50"
          show-value
        />
      </view>

      <!-- 生效时间（可选） -->
      <view class="form-item">
        <text class="label">生效时间（可选）</text>
        <view class="time-range">
          <view class="time-input" @click="showStartTimePicker = true">
            <text v-if="form.startTime">{{ form.startTime }}</text>
            <text v-else class="placeholder">开始时间</text>
          </view>
          <text class="time-separator">至</text>
          <view class="time-input" @click="showEndTimePicker = true">
            <text v-if="form.endTime">{{ form.endTime }}</text>
            <text v-else class="placeholder">结束时间</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="handleSubmit" :disabled="!canSubmit">
        提交上报
      </button>
    </view>

    <!-- 时间选择器 -->
    <picker v-if="showStartTimePicker" mode="time" :value="form.startTime || '00:00'" @change="onStartTimeChange" @cancel="showStartTimePicker = false">
      <view></view>
    </picker>
    <picker v-if="showEndTimePicker" mode="time" :value="form.endTime || '23:59'" @change="onEndTimeChange" @cancel="showEndTimePicker = false">
      <view></view>
    </picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { noParkingZoneApi } from '@/services/api'
import type { GeoPoint } from '@/types'

type NoParkingReason = 'no_parking' | 'temporary_ban' | 'emergency' | 'road_work' | 'event' | 'other'

const form = ref({
  name: '',
  description: '',
  location: { lat: 0, lng: 0 } as GeoPoint,
  radius: 100,
  reason: 'no_parking' as NoParkingReason,
  startTime: '',
  endTime: '',
})

const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)

const reasonOptions = [
  { value: 'no_parking', label: '禁止停车', icon: '🚫' },
  { value: 'temporary_ban', label: '临时禁停', icon: '⛔' },
  { value: 'emergency', label: '应急通道', icon: '🚨' },
  { value: 'road_work', label: '施工禁停', icon: '🚧' },
  { value: 'event', label: '活动禁停', icon: '🎉' },
  { value: 'other', label: '其他', icon: '⚠️' },
] as const

const canSubmit = computed(() => {
  return form.value.name && form.value.location.lat && form.value.reason
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

function onStartTimeChange(e: any) {
  form.value.startTime = e.detail.value
  showStartTimePicker.value = false
}

function onEndTimeChange(e: any) {
  form.value.endTime = e.detail.value
  showEndTimePicker.value = false
}

async function handleSubmit() {
  if (!canSubmit.value) return

  try {
    uni.showLoading({ title: '提交中...' })
    await noParkingZoneApi.create({
      name: form.value.name,
      description: form.value.description,
      location: form.value.location,
      radius: form.value.radius,
      reason: form.value.reason,
      startTime: form.value.startTime || undefined,
      endTime: form.value.endTime || undefined,
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
.no-parking-report-page {
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

.reason-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.reason-option {
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

.reason-icon {
  font-size: 36rpx;
}

.reason-text {
  font-size: 22rpx;
  margin-top: 4rpx;
}

.textarea {
  width: 100%;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 150rpx;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-input {
  flex: 1;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  text-align: center;
  
  .placeholder {
    color: #999;
  }
}

.time-separator {
  color: #666;
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
