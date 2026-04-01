<template>
  <view class="search-page">
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input v-model="keyword" class="search-input" placeholder="搜索路线、途点、日记关键字" />
    </view>

    <view class="section">
      <text class="section-title">热门搜索</text>
      <view class="chip-list">
        <view v-for="item in hotKeywords" :key="item" class="chip" @click="keyword = item">{{ item }}</view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">快捷入口</text>
      <view class="result-card" v-for="item in quickLinks" :key="item.path" @click="goPage(item.path)">
        <view>
          <text class="result-title">{{ item.title }}</text>
          <text class="result-desc">{{ item.desc }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
const hotKeywords = ['318 国道', '怒江大峡谷', '加油站', '高海拔装备', '组队出发']
const quickLinks = [
  { title: '路线列表', desc: '查看当前热门骑行路线。', path: '/pages/route/list' },
  { title: '途点推荐', desc: '按类型筛选补给、住宿和风景点。', path: '/pages/waypoint/list' },
  { title: '摩旅日记', desc: '浏览摩友分享的真实经历。', path: '/pages/diary/list' },
]

function goPage(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}
.search-box {
  display: flex;
  align-items: center;
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 0 16rpx rgba(0, 212, 255, 0.2);
  }
}
.search-icon {
  margin-right: 16rpx;
  font-size: 30rpx;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;

  &::placeholder {
    color: #555577;
  }
}
.section {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 20rpx;
  letter-spacing: 1rpx;
}
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.chip {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 53, 0.15);
  color: #FF6B35;
  font-size: 24rpx;
  border: 1rpx solid rgba(255, 107, 53, 0.3);
  box-shadow: 0 0 8rpx rgba(255, 107, 53, 0.1);
  transition: all 0.3s ease;
}
.result-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 0;
  border-top: 1rpx solid rgba(42, 42, 74, 0.4);
  transition: all 0.3s ease;
}
.result-card:first-of-type {
  border-top: none;
  padding-top: 0;
}
.result-title {
  display: block;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
.result-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8888AA;
}
.arrow {
  font-size: 36rpx;
  color: #555577;
}
</style>
