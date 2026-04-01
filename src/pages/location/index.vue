<template>
  <view class="location-page">
    <view class="section">
      <text class="section-title">我共享的位置</text>
      <view class="share-list">
        <view class="share-item" v-for="share in myShares" :key="share.id">
          <image class="viewer-avatar" :src="share.viewer?.avatar || '/static/avatar.png'" />
          <view class="share-info">
            <text class="viewer-name">{{ share.viewer?.nickname || '家人' }}</text>
            <text class="share-status">{{ share.isActive ? '共享中' : '已停止' }}</text>
          </view>
          <view class="share-actions">
            <text class="action-btn" @click="updateLocation(share.id)" v-if="share.isActive">更新位置</text>
            <text class="action-btn stop" @click="stopShare(share.id)" v-if="share.isActive">停止</text>
            <text class="action-btn delete" @click="deleteShare(share.id)" v-else>删除</text>
          </view>
        </view>
        <view class="empty" v-if="myShares.length === 0"><text>暂无共享</text></view>
      </view>
      <button class="add-btn" @click="showShareModal = true">添加共享</button>
    </view>
    <view class="section">
      <text class="section-title">共享给我的</text>
      <view class="share-list">
        <view class="share-item" v-for="share in sharedWithMe" :key="share.id">
          <image class="owner-avatar" :src="share.owner?.avatar || '/static/avatar.png'" />
          <view class="share-info">
            <text class="owner-name">{{ share.owner?.nickname || '朋友' }}</text>
            <text class="location-info" v-if="share.currentLatitude">📍 {{ share.currentLatitude?.toFixed(4) }}, {{ share.currentLongitude?.toFixed(4) }}</text>
            <text class="update-time" v-if="share.lastUpdatedAt">更新于 {{ formatTime(share.lastUpdatedAt) }}</text>
          </view>
          <view class="share-actions" v-if="share.isActive">
            <text class="action-btn" @click="viewOnMap(share)">查看位置</text>
          </view>
        </view>
        <view class="empty" v-if="sharedWithMe.length === 0"><text>暂无共享</text></view>
      </view>
    </view>
    <view class="modal-mask" v-if="showShareModal" @click="showShareModal = false">
      <view class="modal" @click.stop>
        <text class="modal-title">添加位置共享</text>
        <input class="modal-input" v-model="shareTargetId" placeholder="请输入对方用户ID" type="number" />
        <view class="modal-actions">
          <button @click="showShareModal = false">取消</button>
          <button class="primary" @click="addShare">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const myShares = ref<any[]>([])
const sharedWithMe = ref<any[]>([])
const showShareModal = ref(false)
const shareTargetId = ref('')

onShow(() => { fetchShares() })

async function fetchShares() {
  const [myRes, sharedRes]: [any, any] = await Promise.all([
    uni.request({ url: '/api/locations/shares' }),
    uni.request({ url: '/api/locations/shared' }),
  ])
  if (myRes.data) myShares.value = myRes.data
  if (sharedRes.data) sharedWithMe.value = sharedRes.data
}

async function addShare() {
  if (!shareTargetId.value) return
  await uni.request({ url: '/api/locations/share', method: 'POST', data: { viewerId: shareTargetId.value } })
  showShareModal.value = false
  shareTargetId.value = ''
  uni.showToast({ title: '添加成功' })
  fetchShares()
}

async function updateLocation(id: number) {
  uni.getLocation({
    type: 'gcj02',
    success: async (res) => {
      await uni.request({ url: `/api/locations/shares/${id}`, method: 'PUT', data: { location: `${res.latitude},${res.longitude}` } })
      uni.showToast({ title: '位置已更新' })
      fetchShares()
    },
  })
}

async function stopShare(id: number) {
  await uni.request({ url: `/api/locations/shares/${id}`, method: 'DELETE' })
  uni.showToast({ title: '已停止共享' })
  fetchShares()
}

async function deleteShare(id: number) {
  await uni.request({ url: `/api/locations/shares/${id}`, method: 'DELETE' })
  uni.showToast({ title: '已删除' })
  fetchShares()
}

function viewOnMap(share: any) {
  uni.navigateTo({ url: `/pages/map/viewer?lat=${share.currentLatitude}&lng=${share.currentLongitude}` })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}
</script>

<style lang="scss" scoped>
.location-page {
  min-height: 100vh;
  background: #0A0A1A;
}
.section {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  margin-bottom: 20rpx;
  padding: 30rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}
.share-list {
  margin-bottom: 20rpx;
}
.share-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid rgba(42, 42, 74, 0.4);
  transition: all 0.3s ease;
}
.share-item:last-child {
  border-bottom: none;
}
.viewer-avatar, .owner-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.share-info {
  flex: 1;
}
.viewer-name, .owner-name {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  color: #FFFFFF;
}
.share-status, .location-info, .update-time {
  font-size: 24rpx;
  color: #8888AA;
  display: block;
  margin-top: 8rpx;
}
.share-actions {
  display: flex;
  gap: 10rpx;
}
.action-btn {
  font-size: 24rpx;
  color: #00D4FF;
  padding: 10rpx 20rpx;
  transition: all 0.3s ease;
}
.action-btn.stop {
  color: #FF6B35;
}
.action-btn.delete {
  color: #FF2D78;
}
.empty {
  text-align: center;
  padding: 40rpx;
  color: #555577;
}
.add-btn {
  background: linear-gradient(135deg, #00D4FF, #7B2FFF);
  color: #FFFFFF;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }
}
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: rgba(28, 28, 54, 0.95);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 16rpx;
  padding: 40rpx;
  width: 600rpx;
}
.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  text-align: center;
  margin-bottom: 30rpx;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}
.modal-input {
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;

  &::placeholder {
    color: #555577;
  }
}
.modal-actions {
  display: flex;
  gap: 20rpx;
}
.modal-actions button {
  flex: 1;
  color: #8888AA;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 8rpx;
  transition: all 0.3s ease;
}
.modal-actions .primary {
  background: linear-gradient(135deg, #00D4FF, #7B2FFF);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(0, 212, 255, 0.3);
}
</style>
