<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './uni.scss';

/* 全局样式 - 统一阳光明媚主题 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: $uni-bg-color-grey;
  color: $uni-text-color;
}

/* 统一页面容器样式 */
.page-container,
.route-list-page,
.trip-list-page,
.diary-list-page,
.favorites-page,
.footprint-page,
.help-page,
.location-page,
.login-page,
.map-page,
.preparation-page,
.profile-page,
.search-page,
.settings-page,
.social-page,
.team-page,
.waypoint-page {
  min-height: 100vh;
  background: $uni-bg-color-grey;
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at 20% 20%, rgba(255, 107, 53, 0.05) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(90, 200, 250, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
}

/* 统一卡片样式 */
.card,
.route-card,
.trip-card,
.diary-card,
.team-card {
  background: $uni-bg-color-card;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  padding: $uni-spacing-base;
  border: 1rpx solid $uni-border-color-light;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: $uni-shadow-sm;
  }
}

/* 统一按钮样式 */
button,
.btn {
  font-family: inherit;
  cursor: pointer;
}

/* 统一输入框样式 */
input,
textarea {
  font-family: inherit;
  background: $uni-color-light-2;
  border: 1rpx solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: $uni-spacing-sm;
  color: $uni-text-color;
  
  &::placeholder {
    color: $uni-text-color-placeholder;
  }
  
  &:focus {
    outline: none;
    border-color: $uni-color-primary;
    box-shadow: 0 0 0 2rpx rgba(255, 107, 53, 0.2);
  }
}
</style>
