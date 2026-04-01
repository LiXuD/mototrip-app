<template>
  <view class="help-page">
    <view class="faq-card" v-for="item in faqs" :key="item.question">
      <text class="question">{{ item.question }}</text>
      <text class="answer">{{ item.answer }}</text>
    </view>
    <button class="feedback-btn" @click="copyEmail">复制反馈邮箱</button>
  </view>
</template>

<script setup lang="ts">
const faqs = [
  { question: '离线地图无法更新怎么办？', answer: '请先检查存储权限与网络环境，再前往设置页确认是否开启自动更新。' },
  { question: '如何避免跳转到未开放页面？', answer: '当前版本仅保留已注册页面入口，若仍有问题可在帮助页反馈。' },
  { question: '路线和行程有什么区别？', answer: '路线偏向路书模板，行程偏向带日期和人员安排的实际出行计划。' },
]

function copyEmail() {
  uni.setClipboardData({ data: 'support@mototrip.local' })
}
</script>

<style lang="scss" scoped>
.help-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}
.faq-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  transition: all 0.3s ease;
}
.question {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 14rpx;
}
.answer {
  display: block;
  font-size: 25rpx;
  color: #8888AA;
  line-height: 1.8;
}
.feedback-btn {
  margin-top: 12rpx;
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  border-radius: 20rpx;
  font-size: 30rpx;
  letter-spacing: 1rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }
}
</style>
