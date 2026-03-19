<template>
  <view class="settings-page">
    <!-- 顶部模式显示 -->
    <view class="mode-header">
      <text class="mode-icon">{{ currentModeInfo?.icon }}</text>
      <text class="mode-title">{{ currentModeInfo?.title }}</text>
      <text class="mode-desc">{{ currentModeInfo?.description }}</text>
    </view>

    <!-- 设置内容 -->
    <view class="settings-section">
      <view class="section-title">提醒设置</view>
      
      <!-- 骑行距离提醒 -->
      <view class="setting-item" v-if="settings.mode === 'newbie'">
        <view class="setting-left">
          <text class="setting-label">骑行距离限制</text>
          <text class="setting-hint">超过 {{ settings.maxRideDistance }}km 时提醒</text>
        </view>
        <view class="setting-right">
          <input 
            type="number" 
            v-model="settings.maxRideDistance" 
            class="setting-input"
            @blur="updateSettings"
          />
          <text class="unit">km</text>
        </view>
      </view>

      <!-- 速度限制提醒 -->
      <view class="setting-item" v-if="settings.mode === 'passenger'">
        <view class="setting-left">
          <text class="setting-label">最高速度限制</text>
          <text class="setting-hint">超过 {{ settings.maxSpeed }}km/h 时提醒</text>
        </view>
        <view class="setting-right">
          <input 
            type="number" 
            v-model="settings.maxSpeed" 
            class="setting-input"
            @blur="updateSettings"
          />
          <text class="unit">km/h</text>
        </view>
      </view>

      <!-- 距离提醒开关 -->
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">距离提醒</text>
          <text class="setting-hint">骑行距离过长时提醒休息</text>
        </view>
        <switch 
          :checked="settings.enableDistanceReminder" 
          @change="(e: any) => toggleSetting('enableDistanceReminder', e.detail.value)"
          color="#007AFF"
        />
      </view>

      <!-- 速度提醒开关 -->
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">速度提醒</text>
          <text class="setting-hint">超速时提醒注意安全</text>
        </view>
        <switch 
          :checked="settings.enableSpeedReminder" 
          @change="(e: any) => toggleSetting('enableSpeedReminder', e.detail.value)"
          color="#007AFF"
        />
      </view>

      <!-- 危险路段提醒 -->
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">危险路段提醒</text>
          <text class="setting-hint">接近危险路段时提醒</text>
        </view>
        <switch 
          :checked="settings.enableDangerWarning" 
          @change="(e: any) => toggleSetting('enableDangerWarning', e.detail.value)"
          color="#007AFF"
        />
      </view>
    </view>

    <!-- 模式特定设置 -->
    <view class="settings-section" v-if="settings.mode === 'newbie'">
      <view class="section-title">新手模式设置</view>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">简化界面</text>
          <text class="setting-hint">隐藏复杂功能，只展示核心功能</text>
        </view>
        <switch 
          :checked="settings.enableSimplifiedUI" 
          @change="(e: any) => toggleSetting('enableSimplifiedUI', e.detail.value)"
          color="#007AFF"
        />
      </view>
    </view>

    <view class="settings-section" v-if="settings.mode === 'experienced'">
      <view class="section-title">老手模式设置</view>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">专业功能</text>
          <text class="setting-hint">启用高级路线规划等专业功能</text>
        </view>
        <switch 
          :checked="settings.enableProfessionalFeatures" 
          @change="(e: any) => toggleSetting('enableProfessionalFeatures', e.detail.value)"
          color="#007AFF"
        />
      </view>
    </view>

    <view class="settings-section" v-if="settings.mode === 'passenger'">
      <view class="section-title">带人模式设置</view>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">舒适度优先</text>
          <text class="setting-hint">优先推荐舒适休闲的路线</text>
        </view>
        <switch 
          :checked="settings.enableComfortMode" 
          @change="(e: any) => toggleSetting('enableComfortMode', e.detail.value)"
          color="#007AFF"
        />
      </view>
    </view>

    <!-- 切换模式按钮 -->
    <view class="action-section">
      <button class="switch-btn" @click="goModeSelection">
        切换骑行模式
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store'
import type { UserModeSettings, UserMode, UserModeInfo } from '@/types'

const userStore = useUserStore()

// 模式信息映射
const modeInfoMap: Record<UserMode, UserModeInfo> = {
  newbie: {
    mode: 'newbie',
    title: '新手模式',
    description: '适合骑行新手，更多保护提醒，建议简单路线',
    icon: '🌱',
    features: ['距离限制提醒', '简化界面', '推荐简单路线'],
  },
  experienced: {
    mode: 'experienced',
    title: '老手模式',
    description: '适合经验丰富的骑手，解锁全部专业功能',
    icon: '🏍️',
    features: ['无距离限制', '专业功能', '危险路段详报'],
  },
  passenger: {
    mode: 'passenger',
    title: '带人模式',
    description: '适合休闲骑行，舒适度优先，较低速度提醒',
    icon: '👥',
    features: ['速度限制提醒', '舒适路线', '休闲景点推荐'],
  },
}

const settings = ref<Partial<UserModeSettings>>({})

const currentModeInfo = computed(() => {
  const mode = userStore.currentMode
  return mode ? modeInfoMap[mode] : null
})

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.loadUserMode()
    if (userStore.userMode) {
      settings.value = { ...userStore.userMode }
    }
  }
})

async function toggleSetting(key: keyof UserModeSettings, value: boolean | number | string) {
  (settings.value as any)[key] = value
  await updateSettings()
}

async function updateSettings() {
  try {
    uni.showLoading({ title: '保存中...' })
    await userStore.updateUserMode(settings.value)
    uni.hideLoading()
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '保存失败',
      icon: 'none',
    })
  }
}

function goModeSelection() {
  uni.navigateTo({
    url: '/pages/profile/mode',
  })
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.mode-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.mode-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.mode-title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.mode-desc {
  font-size: 26rpx;
  opacity: 0.9;
  text-align: center;
}

.settings-section {
  background: #fff;
  margin: 30rpx;
  border-radius: 16rpx;
  padding: 20rpx 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.setting-left {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.setting-hint {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.setting-right {
  display: flex;
  align-items: center;
}

.setting-input {
  width: 120rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.unit {
  font-size: 26rpx;
  color: #666;
}

.action-section {
  padding: 30rpx;
}

.switch-btn {
  width: 100%;
  background: #fff;
  color: #007AFF;
  border: 1rpx solid #007AFF;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
}
</style>
