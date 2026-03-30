<template>
  <view class="preparation-list-page">
    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-header">
        <view class="progress-title-wrapper">
          <text class="progress-icon">🎒</text>
          <text class="progress-title">打包进度</text>
        </view>
        <view class="progress-status">
          <text class="progress-count">{{ packedCount }}/{{ totalCount }}</text>
          <text class="progress-percent" v-if="totalCount > 0">({{ Math.round(progress) }}%)</text>
        </view>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progress + '%' }"></view>
      </view>
    </view>

    <!-- 清单列表 -->
    <scroll-view class="checklist" scroll-y>
      <view class="category" v-for="group in groupedItems" :key="group.category">
        <view class="category-header">
          <view class="category-title-wrapper">
            <text class="category-icon">{{ getCategoryIcon(group.category) }}</text>
            <text class="category-name">{{ group.category }}</text>
          </view>
          <view class="category-progress">
            <text>{{ group.items.filter(i => i.isPacked).length }}/{{ group.items.length }}</text>
          </view>
        </view>
        <view class="item-list">
          <view 
            class="check-item" 
            v-for="item in group.items" 
            :key="item.id" 
            @click="togglePacked(item.id)"
            :class="{ packed: item.isPacked }"
          >
            <view class="checkbox" :class="{ checked: item.isPacked }">
              <text v-if="item.isPacked">✓</text>
            </view>
            <view class="item-content">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-desc ellipsis" v-if="item.description">{{ item.description }}</text>
            </view>
            <view class="essential-tag" v-if="item.isEssential">必带</view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="groupedItems.length === 0">
        <text class="empty-icon">🎒</text>
        <text class="empty-text">还没有清单</text>
        <text class="empty-hint">点击右下角添加你的摩旅装备</text>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="fab" @click="showAddModal">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePreparationStore } from '@/store'

const preparationStore = usePreparationStore()

const packedCount = computed(() => preparationStore.packedCount)
const totalCount = computed(() => preparationStore.totalCount)
const progress = computed(() => preparationStore.progress)
const groupedItems = computed(() => preparationStore.groupedItems)

onMounted(() => {
  preparationStore.fetchPreparations()
})

function togglePacked(id: number) {
  preparationStore.togglePacked(id)
}

function getCategoryIcon(category: string) {
  const map: Record<string, string> = {
    '骑行装备': '🏍️',
    '个人物品': '👕',
    '电子设备': '📱',
    '工具': '🔧',
    '药品': '💊',
    '证件': '📄',
    'other': '📦',
  }
  return map[category] || '📦'
}

function showAddModal() {
  uni.showModal({
    title: '添加物品',
    editable: true,
    placeholderText: '请输入物品名称',
    success: (res) => {
      if (res.confirm && res.content) {
        preparationStore.addItem({
          name: res.content,
          category: 'other',
          isEssential: false,
          isPacked: false,
        })
        uni.showToast({ title: '添加成功', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.preparation-list-page {
  min-height: 100vh;
  background: #F2F2F7;
}

/* 进度条区域 */
.progress-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-title-wrapper {
  display: flex;
  align-items: center;
}

.progress-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.progress-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.progress-status {
  display: flex;
  align-items: baseline;
}

.progress-count {
  font-size: 36rpx;
  font-weight: 700;
  color: #FF6B35;
}

.progress-percent {
  font-size: 26rpx;
  color: #8E8E93;
  margin-left: 8rpx;
}

.progress-bar {
  height: 20rpx;
  background: #F2F2F7;
  border-radius: 10rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35, #FF8A5C);
  border-radius: 10rpx;
  transition: width 0.3s ease;
}

/* 清单列表 */
.checklist {
  height: calc(100vh - 220rpx);
  padding: 0 24rpx;
}

.category {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
}

.category-title-wrapper {
  display: flex;
  align-items: center;
}

.category-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.category-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.category-progress {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.item-list {
  padding: 8rpx 0;
}

.check-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F2F2F7;
  transition: background 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #F8F8F8;
  }
  
  &.packed {
    .item-name {
      color: #8E8E93;
      text-decoration: line-through;
    }
  }
}

.checkbox {
  width: 48rpx;
  height: 48rpx;
  border: 3rpx solid #E5E5EA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.2s;
  
  &.checked {
    background: linear-gradient(135deg, #FF6B35, #FF8A5C);
    border-color: #FF6B35;
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: 700;
  }
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  color: #1A1A2E;
  display: block;
  transition: color 0.2s;
}

.item-desc {
  font-size: 24rpx;
  color: #8E8E93;
  display: block;
  margin-top: 6rpx;
}

.essential-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  background: rgba(255, 59, 48, 0.12);
  color: #FF3B30;
  border-radius: 16rpx;
  font-weight: 600;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #8E8E93;
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  
  &:active {
    transform: scale(0.95);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
}
</style>
