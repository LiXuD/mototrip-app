<template>
  <view class="night-warning" v-if="visible && isNight">
    <view class="warning-icon">🌙</view>
    <view class="warning-content">
      <text class="warning-title">夜间骑行警告</text>
      <text class="warning-message">{{ message }}</text>
      <text class="warning-time">日落时间: {{ sunset }} | 日出时间: {{ sunrise }}</text>
    </view>
    <view class="close-btn" @click="handleClose">×</view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { warningApi } from '@/services/api'

interface Props {
  lat: number
  lng: number
  autoShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoShow: true,
})

const emit = defineEmits<{
  close: []
  nightChange: [isNight: boolean]
}>()

const visible = ref(true)
const isNight = ref(false)
const sunrise = ref('')
const sunset = ref('')
const message = ref('')

async function checkNightStatus() {
  try {
    const result = await warningApi.checkNightRiding(props.lat, props.lng) as {
      isNight: boolean
      sunrise: string
      sunset: string
      message: string
    }
    isNight.value = result.isNight
    sunrise.value = result.sunrise
    sunset.value = result.sunset
    message.value = result.message
    emit('nightChange', result.isNight)
  } catch (e) {
    console.error('检查夜间状态失败:', e)
  }
}

function handleClose() {
  visible.value = false
  emit('close')
}

// 定时检查（每5分钟检查一次）
let timer: ReturnType<typeof setInterval> | null = null

watch(() => [props.lat, props.lng], () => {
  if (props.autoShow) {
    checkNightStatus()
  }
}, { immediate: true })

if (props.autoShow) {
  timer = setInterval(checkNightStatus, 5 * 60 * 1000)
}

defineExpose({
  checkNightStatus,
  isNight,
})
</script>

<style lang="scss" scoped>
.night-warning {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0A0A1A 0%, #1A1020 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx;
  border: 1rpx solid rgba(255, 214, 0, 0.4);
  box-shadow: 0 0 16rpx rgba(255, 214, 0, 0.15);
  transition: all 0.3s ease;
}

.warning-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.warning-content {
  flex: 1;
}

.warning-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #FFD600;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.warning-message {
  display: block;
  font-size: 24rpx;
  color: #C0C0D0;
  line-height: 1.4;
}

.warning-time {
  display: block;
  font-size: 22rpx;
  color: #8888AA;
  margin-top: 8rpx;
}

.close-btn {
  font-size: 40rpx;
  color: #8888AA;
  padding: 10rpx;
  line-height: 1;
  transition: all 0.3s ease;

  &:active {
    color: #FFFFFF;
  }
}
</style>
