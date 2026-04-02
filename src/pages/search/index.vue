<template>
  <view class="search-page">
    <view class="search-box">
      <IconSvg name="search" :size="30" color="#1A1A2E" />
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
.search-page { min-height: 100vh; background: #f2f2f7; padding: 24rpx; }
.search-box { display: flex; align-items: center; background: #fff; border-radius: 24rpx; padding: 20rpx 24rpx; margin-bottom: 24rpx; }
.search-icon { margin-right: 16rpx; font-size: 30rpx; }
.search-input { flex: 1; font-size: 28rpx; height: 80rpx; box-sizing: border-box; }
.section { background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 20rpx; }
.section-title { display: block; font-size: 30rpx; font-weight: 600; color: #1a1a2e; margin-bottom: 20rpx; }
.chip-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.chip { padding: 14rpx 24rpx; border-radius: 999rpx; background: #fff1eb; color: #ff6b35; font-size: 24rpx; }
.result-card { display: flex; align-items: center; justify-content: space-between; padding: 22rpx 0; border-top: 1rpx solid #f2f2f7; }
.result-card:first-of-type { border-top: none; padding-top: 0; }
.result-title { display: block; font-size: 28rpx; color: #1a1a2e; font-weight: 600; }
.result-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #8e8e93; }
.arrow { font-size: 36rpx; color: #c7c7cc; }
</style>
