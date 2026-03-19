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
.location-page { min-height: 100vh; background: #f5f5f5; }
.section { background: #fff; margin-bottom: 20rpx; padding: 30rpx; }
.section-title { font-size: 32rpx; font-weight: bold; display: block; margin-bottom: 20rpx; }
.share-list { margin-bottom: 20rpx; }
.share-item { display: flex; align-items: center; padding: 20rpx; border-bottom: 1rpx solid #eee; }
.share-item:last-child { border-bottom: none; }
.viewer-avatar, .owner-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; margin-right: 20rpx; }
.share-info { flex: 1; }
.viewer-name, .owner-name { font-size: 28rpx; font-weight: bold; display: block; }
.share-status, .location-info, .update-time { font-size: 24rpx; color: #666; display: block; margin-top: 8rpx; }
.share-actions { display: flex; gap: 10rpx; }
.action-btn { font-size: 24rpx; color: #007AFF; padding: 10rpx 20rpx; }
.action-btn.stop { color: #FF9500; }
.action-btn.delete { color: #FF3B30; }
.empty { text-align: center; padding: 40rpx; color: #999; }
.add-btn { background: #007AFF; color: #fff; border-radius: 8rpx; }
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.modal { background: #fff; border-radius: 16rpx; padding: 40rpx; width: 600rpx; }
.modal-title { font-size: 32rpx; font-weight: bold; display: block; text-align: center; margin-bottom: 30rpx; }
.modal-input { border: 1rpx solid #ddd; padding: 20rpx; border-radius: 8rpx; margin-bottom: 30rpx; }
.modal-actions { display: flex; gap: 20rpx; }
.modal-actions button { flex: 1; }
.modal-actions .primary { background: #007AFF; color: #fff; }
</style>
