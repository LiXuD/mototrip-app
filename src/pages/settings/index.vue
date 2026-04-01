<template>
  <view class="settings-page">
    <view class="group">
      <text class="group-title">通知设置</text>
      <view class="row"><text>危险路段提醒</text><switch :checked="settings.alert" color="#FF6B35" @change="settings.alert = $event.detail.value" /></view>
      <view class="row"><text>组队消息提醒</text><switch :checked="settings.team" color="#FF6B35" @change="settings.team = $event.detail.value" /></view>
      <view class="row"><text>离线地图自动更新</text><switch :checked="settings.offline" color="#FF6B35" @change="settings.offline = $event.detail.value" /></view>
    </view>
    <view class="group">
      <text class="group-title">其他</text>
      <view class="row static"><text>清理缓存</text><text class="row-value">128MB</text></view>
      <view class="row static"><text>当前版本</text><text class="row-value">1.0.0</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({ alert: true, team: true, offline: false })
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}
.group {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 12rpx 24rpx;
  margin-bottom: 20rpx;
}
.group-title {
  display: block;
  padding: 16rpx 0;
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-top: 1rpx solid rgba(42, 42, 74, 0.4);
  font-size: 28rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;
}
.row.static .row-value {
  color: #8888AA;
  font-size: 24rpx;
}
</style>
