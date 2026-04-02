<template>
  <scroll-view class="diary-detail-page" scroll-y>
    <view v-if="diary" class="cover">
      <text class="cover-tag">旅行日记</text>
      <text class="cover-title">{{ diary.title }}</text>
      <text class="cover-meta">
        {{ diary.locationName || '未填写地点' }} · {{ formatDate(diary.createdAt) }} · {{ diary.weather || '天气待补充' }}
      </text>
    </view>

    <view v-if="diary" class="content-card">
      <view class="author-row">
        <image class="avatar" :src="diary.user?.avatar || '/static/avatar.png'" />
        <view>
          <text class="author-name">{{ diary.user?.nickname || '骑士' }}</text>
          <text class="author-sub">心情 {{ getMoodText(diary.mood) }} · 点赞 {{ diary.likes || 0 }}</text>
        </view>
      </view>
      <text class="paragraph">{{ diary.content }}</text>
      <view v-if="diary.images?.length" class="gallery">
        <image v-for="(item, index) in diary.images" :key="index" class="gallery-item" :src="item" mode="aspectFill" />
      </view>
    </view>

    <view v-if="diary" class="content-card">
      <text class="section-title">补充信息</text>
      <text class="comment-text">所属行程：{{ diary.trip?.name || '未关联行程' }}</text>
      <text class="comment-text">评论数：{{ diary.comments || 0 }}</text>
      <text class="comment-text">温度：{{ diary.temperature ?? '—' }}°C</text>
    </view>

    <view v-else-if="!loading" class="content-card empty-state">
      <text class="section-title">未找到日记</text>
      <text class="comment-text">请返回日记列表重新选择。</text>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { diaryApi } from '@/services/api'
import type { Diary } from '@/types'

const loading = ref(false)
const diary = ref<Diary | null>(null)

onLoad((options) => {
  const id = Number(options?.id || 0)
  if (id) {
    loadDiaryDetail(id)
  }
})

async function loadDiaryDetail(id: number) {
  loading.value = true
  try {
    diary.value = await diaryApi.getDetail(id) as Diary
  } catch (error) {
    console.error('加载日记详情失败:', error)
    uni.showToast({ title: '日记加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function formatDate(value?: string) {
  if (!value) return '未知时间'
  const date = new Date(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function getMoodText(mood?: Diary['mood']) {
  const map: Record<string, string> = {
    happy: '开心',
    excited: '兴奋',
    calm: '平静',
    tired: '疲惫',
    neutral: '普通',
  }
  return mood ? map[mood] || mood : '未填写'
}
</script>

<style lang="scss" scoped>
.diary-detail-page { 
  height: 100vh; 
  background: #f2f2f7; 
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.cover { background: linear-gradient(180deg, rgba(26,26,46,0.85), rgba(255,107,53,0.9)), url('/static/poster-bg.png'); padding: 120rpx 32rpx 40rpx; color: #fff; }
.cover-tag { display: inline-flex; background: rgba(255,255,255,0.16); padding: 8rpx 20rpx; border-radius: 999rpx; font-size: 24rpx; margin-bottom: 24rpx; }
.cover-title { display: block; font-size: 48rpx; font-weight: 700; margin-bottom: 12rpx; }
.cover-meta { display: block; font-size: 24rpx; opacity: 0.9; }
.content-card { margin: 24rpx; padding: 28rpx; background: #fff; border-radius: 24rpx; }
.author-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 24rpx; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 50%; }
.author-name { display: block; font-size: 30rpx; font-weight: 600; color: #1a1a2e; }
.author-sub { display: block; margin-top: 6rpx; font-size: 24rpx; color: #8e8e93; }
.paragraph { display: block; font-size: 28rpx; color: #333; line-height: 1.9; margin-bottom: 22rpx; }
.gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.gallery-item { width: 100%; height: 220rpx; border-radius: 18rpx; }
.section-title { display: block; font-size: 30rpx; font-weight: 600; color: #1a1a2e; margin-bottom: 20rpx; }
.comment-text { display: block; font-size: 25rpx; color: #666; line-height: 1.8; margin-top: 12rpx; }
.empty-state { text-align: center; }
</style>
