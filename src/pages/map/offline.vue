<template>
  <view class="offline-map-page">
    <!-- 顶部提示 -->
    <view class="tip-box" v-if="maps.length === 0 && !loading">
      <text class="tip-icon">📍</text>
      <text class="tip-text">暂无离线地图</text>
      <text class="tip-sub">点击下方按钮下载离线地图，无网也能用</text>
    </view>

    <!-- 离线地图列表 -->
    <scroll-view class="map-list" scroll-y v-if="maps.length > 0">
      <view class="map-card" v-for="item in maps" :key="item.id">
        <view class="map-info">
          <text class="map-name">{{ item.name }}</text>
          <text class="map-desc" v-if="item.description">{{ item.description }}</text>
          <view class="map-meta">
            <text class="meta-item">📐 {{ item.minLat.toFixed(2) }}~{{ item.maxLat.toFixed(2) }}°</text>
            <text class="meta-item">📐 {{ item.minLng.toFixed(2) }}~{{ item.maxLng.toFixed(2) }}°</text>
            <text class="meta-item">🔍 {{ item.minZoom }}~{{ item.maxZoom }}级</text>
          </view>
          <view class="map-stats">
            <text class="stat-item">{{ item.fileSize || '未知大小' }}</text>
            <text class="stat-item">{{ item.downloadedCount }}/{{ item.tileCount }} 瓦片</text>
          </view>
        </view>

        <view class="map-status">
          <!-- 进度条 -->
          <view class="progress-box" v-if="item.status === 'downloading'">
            <progress :percent="item.downloadProgress" :stroke-width="6" activeColor="#007AFF" backgroundColor="#e5e5e5" border-radius="4" />
            <text class="progress-text">{{ item.downloadProgress }}%</text>
          </view>

          <!-- 状态标签 -->
          <text class="status-tag" :class="'status-' + item.status">
            {{ getStatusText(item.status) }}
          </text>
        </view>

        <view class="map-actions">
          <button 
            class="action-btn download" 
            v-if="item.status === 'pending' || item.status === 'failed'"
            @click="startDownload(item.id)"
          >
            {{ item.status === 'failed' ? '重新下载' : '开始下载' }}
          </button>
          <button 
            class="action-btn view" 
            v-if="item.status === 'completed'"
            @click="viewMap(item.id)"
          >
            查看地图
          </button>
          <button 
            class="action-btn delete" 
            @click="deleteMap(item.id)"
          >
            删除
          </button>
        </view>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 创建按钮 -->
    <view class="fab" @click="showCreateModal = true">+</view>

    <!-- 创建弹窗 -->
    <view class="modal-mask" v-if="showCreateModal" @click="showCreateModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建离线地图</text>
          <text class="modal-close" @click="showCreateModal = false">✕</text>
        </view>

        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">名称</text>
            <input class="form-input" v-model="newMap.name" placeholder="例如：川西环线" />
          </view>

          <view class="form-item">
            <text class="form-label">描述（可选）</text>
            <input class="form-input" v-model="newMap.description" placeholder="简要描述" />
          </view>

          <view class="form-item">
            <text class="form-label">地图区域</text>
            <view class="coordinate-box">
              <view class="coord-row">
                <text class="coord-label">纬度范围</text>
                <input class="form-input small" v-model="newMap.minLat" placeholder="最小纬度" type="digit" />
                <text class="coord-sep">~</text>
                <input class="form-input small" v-model="newMap.maxLat" placeholder="最大纬度" type="digit" />
              </view>
              <view class="coord-row">
                <text class="coord-label">经度范围</text>
                <input class="form-input small" v-model="newMap.minLng" placeholder="最小经度" type="digit" />
                <text class="coord-sep">~</text>
                <input class="form-input small" v-model="newMap.maxLng" placeholder="最大经度" type="digit" />
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">缩放级别</text>
            <view class="zoom-box">
              <input class="form-input small" v-model="newMap.minZoom" placeholder="最小" type="number" />
              <text class="coord-sep">~</text>
              <input class="form-input small" v-model="newMap.maxZoom" placeholder="最大" type="number" />
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-cancel" @click="showCreateModal = false">取消</button>
          <button class="btn-confirm" @click="createMap" :disabled="!canCreate">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { mapApi } from '@/services/api'
import type { OfflineMap } from '@/types'

const maps = ref<OfflineMap[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const newMap = ref({
  name: '',
  description: '',
  minLat: '',
  maxLat: '',
  minLng: '',
  maxLng: '',
  minZoom: '10',
  maxZoom: '16',
})

const canCreate = computed(() => {
  return newMap.value.name && 
    newMap.value.minLat && 
    newMap.value.maxLat && 
    newMap.value.minLng && 
    newMap.value.maxLng
})

onMounted(() => {
  fetchMaps()
})

async function fetchMaps() {
  loading.value = true
  try {
    const res = await mapApi.list() as OfflineMap[]
    maps.value = res
  } catch (e) {
    console.error('Failed to fetch maps:', e)
    uni.showToast({
      title: '获取列表失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

async function createMap() {
  if (!canCreate.value) return

  try {
    const data = {
      name: newMap.value.name,
      description: newMap.value.description,
      minLat: parseFloat(newMap.value.minLat),
      maxLat: parseFloat(newMap.value.maxLat),
      minLng: parseFloat(newMap.value.minLng),
      maxLng: parseFloat(newMap.value.maxLng),
      minZoom: parseInt(newMap.value.minZoom),
      maxZoom: parseInt(newMap.value.maxZoom),
    }

    const result = await mapApi.create(data) as OfflineMap
    maps.value.unshift(result)
    showCreateModal.value = false

    // 重置表单
    newMap.value = {
      name: '',
      description: '',
      minLat: '',
      maxLat: '',
      minLng: '',
      maxLng: '',
      minZoom: '10',
      maxZoom: '16',
    }

    uni.showToast({
      title: '创建成功',
      icon: 'success',
    })
  } catch (e) {
    console.error('Failed to create map:', e)
    uni.showToast({
      title: '创建失败',
      icon: 'none',
    })
  }
}

async function startDownload(id: number) {
  try {
    await mapApi.startDownload(id)

    // 更新状态为下载中
    const map = maps.value.find(m => m.id === id)
    if (map) {
      map.status = 'downloading'
      map.downloadProgress = 0
    }

    // 轮询进度
    pollProgress(id)

    uni.showToast({
      title: '开始下载',
      icon: 'success',
    })
  } catch (e) {
    console.error('Failed to start download:', e)
    uni.showToast({
      title: '启动下载失败',
      icon: 'none',
    })
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null

function pollProgress(id: number) {
  if (pollTimer) clearInterval(pollTimer)

  pollTimer = setInterval(async () => {
    try {
      const res = await mapApi.getDetail(id) as OfflineMap
      const index = maps.value.findIndex(m => m.id === id)
      if (index !== -1) {
        maps.value[index] = res

        if (res.status === 'completed' || res.status === 'failed') {
          if (pollTimer) clearInterval(pollTimer)
          pollTimer = null

          uni.showToast({
            title: res.status === 'completed' ? '下载完成' : '下载失败',
            icon: res.status === 'completed' ? 'success' : 'none',
          })
        }
      }
    } catch (e) {
      console.error('Poll error:', e)
    }
  }, 3000)
}

function viewMap(id: number) {
  uni.navigateTo({
    url: `/pages/map/viewer?id=${id}`,
  })
}

async function deleteMap(id: number) {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await mapApi.delete(id)
          maps.value = maps.value.filter(m => m.id !== id)
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
        } catch (e) {
          console.error('Failed to delete:', e)
          uni.showToast({
            title: '删除失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待下载',
    downloading: '下载中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.offline-map-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.tip-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  color: #999;
}

.tip-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.tip-text {
  font-size: 32rpx;
  margin-bottom: 12rpx;
}

.tip-sub {
  font-size: 26rpx;
  color: #bbb;
}

.map-list {
  height: calc(100vh - 240rpx);
}

.map-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.map-info {
  margin-bottom: 16rpx;
}

.map-name {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.map-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.map-meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: 12rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.map-stats {
  display: flex;
  gap: 20rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #666;
}

.map-status {
  margin-bottom: 16rpx;
}

.progress-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #007AFF;
}

.status-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  font-size: 24rpx;
  border-radius: 8rpx;

  &.status-pending {
    background: #f5f5f5;
    color: #999;
  }
  &.status-downloading {
    background: #e3f2fd;
    color: #1976d2;
  }
  &.status-completed {
    background: #e8f5e9;
    color: #4caf50;
  }
  &.status-failed {
    background: #ffebee;
    color: #f44336;
  }
}

.map-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  font-size: 26rpx;
  padding: 16rpx 0;
  border-radius: 8rpx;
  border: none;

  &.download {
    background: #007AFF;
    color: #fff;
  }
  &.view {
    background: #4caf50;
    color: #fff;
  }
  &.delete {
    background: #f5f5f5;
    color: #666;
  }
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.4);
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 32rpx;
  color: #999;
}

.modal-body {
  padding: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;

  &.small {
    width: 160rpx;
    text-align: center;
  }
}

.coordinate-box, .zoom-box {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.coord-row, .zoom-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.coord-label {
  font-size: 24rpx;
  color: #666;
  width: 140rpx;
}

.coord-sep {
  color: #999;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 24rpx;
  font-size: 28rpx;
  border: none;
  border-radius: 0;
  background: #fff;
}

.btn-cancel {
  color: #666;
  border-right: 1rpx solid #eee;
}

.btn-confirm {
  color: #007AFF;
  background: #fff;

  &[disabled] {
    color: #ccc;
  }
}
</style>
