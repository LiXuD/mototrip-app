<template>
  <view class="about-page">
    <view class="hero">
      <text class="logo">🏍️</text>
      <text class="title">摩旅助手</text>
      <text class="subtitle">为路线规划、风险提醒、组队和旅途记录提供一站式支持。</text>
    </view>
    <view class="card">
      <text class="section-title">我们在做什么</text>
      <text class="paragraph">通过路线、途点、日记、社区和离线地图能力，让摩友在出发前能充分准备，在路上能及时获取帮助，在返程后能沉淀真实经验。</text>
      <text class="paragraph">当前版本重点支持路线浏览、出发规划、骑行模式设置和基础社区互动。</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 24rpx;
}
.hero {
  background: linear-gradient(135deg, #7B2FFF, #00D4FF, #00FF88);
  border-radius: 28rpx;
  padding: 40rpx 24rpx;
  text-align: center;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}
.logo {
  display: block;
  font-size: 80rpx;
  margin-bottom: 12rpx;
}
.title {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}
.subtitle {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
  opacity: 0.92;
  color: #FFFFFF;
}
.card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 24rpx;
}
.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 18rpx;
  letter-spacing: 1rpx;
}
.paragraph {
  display: block;
  font-size: 26rpx;
  color: #8888AA;
  line-height: 1.9;
  margin-bottom: 16rpx;
}
</style>
