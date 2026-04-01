<template>
  <view class="favorites-page">
    <view class="tabs">
      <view v-for="item in tabs" :key="item" class="tab" :class="{ active: currentTab === item }" @click="currentTab = item">{{ item }}</view>
    </view>
    <view class="favorite-card" v-for="item in filteredItems" :key="item.id">
      <text class="favorite-title">{{ item.title }}</text>
      <text class="favorite-desc">{{ item.desc }}</text>
      <text class="favorite-meta">{{ item.type }} · {{ item.savedAt }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const tabs = ['全部', '路线', '日记', '途点']
const currentTab = ref('全部')
const items = [
  { id: 1, type: '路线', title: '318 东达山路书', desc: '收藏的路线方案，包含高海拔注意事项。', savedAt: '今天' },
  { id: 2, type: '日记', title: '雨夜穿越折多山', desc: '记下雨战经验和装备清单。', savedAt: '昨天' },
  { id: 3, type: '途点', title: '独克宗骑士驿站', desc: '适合停车、补给和夜宿。', savedAt: '本周' },
]
const filteredItems = computed(() => currentTab.value === '全部' ? items : items.filter((item) => item.type === currentTab.value))
</script>

<style lang="scss" scoped>
.favorites-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}
.tabs {
  display: flex;
  gap: 14rpx;
  margin-bottom: 20rpx;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 18rpx;
  color: #8888AA;
  font-size: 26rpx;
  transition: all 0.3s ease;
}
.tab.active {
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
}
.favorite-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  transition: all 0.3s ease;
}
.favorite-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}
.favorite-desc, .favorite-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8888AA;
  line-height: 1.7;
}
</style>
