<template>
  <view class="mode-page">
    <!-- 顶部说明 -->
    <view class="header">
      <text class="title">选择您的骑行模式</text>
      <text class="subtitle">不同模式为您提供不同的功能和建议</text>
    </view>

    <!-- 模式列表 -->
    <view class="mode-list">
      <view 
        v-for="mode in modeList" 
        :key="mode.mode"
        class="mode-card"
        :class="{ active: selectedMode === mode.mode }"
        @click="selectMode(mode.mode)"
      >
        <view class="mode-icon">{{ mode.icon }}</view>
        <view class="mode-content">
          <text class="mode-title">{{ mode.title }}</text>
          <text class="mode-description">{{ mode.description }}</text>
          <view class="mode-features">
            <text v-for="feature in mode.features" :key="feature" class="feature-tag">
              {{ feature }}
            </text>
          </view>
        </view>
        <view class="mode-check" v-if="selectedMode === mode.mode">
          <text class="check-icon">✓</text>
        </view>
      </view>
    </view>

    <!-- 当前模式显示 -->
    <view class="current-mode" v-if="currentMode">
      <text class="current-label">当前模式: {{ getModeName(currentMode) }}</text>
    </view>

    <!-- 确认按钮 -->
    <view class="action-section">
      <button class="confirm-btn" @click="confirmMode" :disabled="!selectedMode">
        确认切换
      </button>
      <button class="cancel-btn" @click="goBack">
        取消
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store'
import type { UserMode, UserModeInfo } from '@/types'

const userStore = useUserStore()

// 模式列表数据
const modeList: UserModeInfo[] = [
  {
    mode: 'newbie',
    title: '新手模式',
    description: '适合骑行新手，更多保护提醒，建议简单路线',
    icon: '🌱',
    features: ['距离限制提醒', '简化界面', '推荐简单路线', '新手教程'],
  },
  {
    mode: 'experienced',
    title: '老手模式',
    description: '适合经验丰富的骑手，解锁全部专业功能',
    icon: '🏍️',
    features: ['无距离限制', '专业功能', '危险路段详报', '高级路线规划'],
  },
  {
    mode: 'passenger',
    title: '带人模式',
    description: '适合休闲骑行，舒适度优先，较低速度提醒',
    icon: '👥',
    features: ['速度限制提醒', '舒适路线', '休闲景点推荐', '低速提醒'],
  },
]

const selectedMode = ref<UserMode | null>(null)
const currentMode = ref<UserMode | null>(null)

onMounted(async () => {
  // 加载当前用户模式
  if (userStore.isLoggedIn) {
    await userStore.loadUserMode()
    currentMode.value = userStore.currentMode
    selectedMode.value = userStore.currentMode
  }
})

function selectMode(mode: UserMode) {
  selectedMode.value = mode
}

function getModeName(mode: UserMode): string {
  const modeItem = modeList.find(m => m.mode === mode)
  return modeItem?.title || ''
}

async function confirmMode() {
  if (!selectedMode.value) return

  try {
    uni.showLoading({ title: '切换中...' })
    await userStore.switchUserMode(selectedMode.value)
    uni.hideLoading()
    
    uni.showToast({
      title: '模式切换成功',
      icon: 'success',
    })
    
    setTimeout(() => {
      goBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '切换失败',
      icon: 'none',
    })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.mode-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: #666;
}

.mode-list {
  margin-bottom: 40rpx;
}

.mode-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  border: 4rpx solid transparent;
  position: relative;
  
  &.active {
    border-color: #007AFF;
    background: #f0f7ff;
  }
}

.mode-icon {
  font-size: 60rpx;
  margin-right: 24rpx;
}

.mode-content {
  flex: 1;
}

.mode-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.mode-description {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.mode-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.feature-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
}

.mode-check {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 44rpx;
  height: 44rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.current-mode {
  text-align: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 40rpx;
}

.current-label {
  font-size: 28rpx;
  color: #666;
}

.action-section {
  padding: 20rpx 0;
}

.confirm-btn {
  width: 100%;
  background: #007AFF;
  color: #fff;
  border: none;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  
  &:disabled {
    background: #ccc;
  }
}

.cancel-btn {
  width: 100%;
  background: #fff;
  color: #666;
  border: 1rpx solid #ddd;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
}
</style>
