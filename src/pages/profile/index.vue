<template>
  <view class="profile-page">
    <!-- 头部 -->
    <view class="profile-header">
      <view class="header-bg"></view>
      <view class="user-info" v-if="userStore.isLoggedIn">
        <view class="avatar-wrapper">
          <image class="avatar" :src="userStore.userInfo?.avatar || '/static/avatar.png'" />
          <view class="avatar-edit" @click="editProfile">
            <IconSvg name="edit" :size="24" color="#1A1A2E" />
          </view>
        </view>
        <text class="nickname">{{ userStore.userInfo?.nickname || '骑士' }}</text>
        <text class="bio">{{ userStore.userInfo?.bio || '添加简介让大家认识你' }}</text>
        <view class="motorcycle-tag" v-if="userStore.userInfo?.motorcycle">
          <IconSvg name="motorcycle" :size="24" color="#FFFFFF" style="margin-right: 4rpx" /> <text>{{ userStore.userInfo.motorcycle }}</text>
        </view>
      </view>
      <view class="login-prompt" v-else>
        <view class="login-avatar">
          <IconSvg name="motorcycle" :size="80" color="#FFFFFF" />
        </view>
        <text class="prompt-title">欢迎来到摩旅助手</text>
        <text class="prompt-text">登录后享受更多功能</text>
        <button class="login-btn" @click="goLogin">立即登录</button>
      </view>
    </view>

    <!-- 统计 -->
    <view class="stats-section" v-if="userStore.isLoggedIn">
      <view class="stat-item" @click="goPage('/pages/route/my')">
        <text class="stat-num">{{ stats.routes }}</text>
        <text class="stat-label">路线</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goPage('/pages/trip/list')">
        <text class="stat-num">{{ stats.trips }}</text>
        <text class="stat-label">行程</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goPage('/pages/diary/list')">
        <text class="stat-num">{{ stats.diaries }}</text>
        <text class="stat-label">日记</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goPage('/pages/footprint/index')">
        <text class="stat-num">{{ stats.followers }}</text>
        <text class="stat-label">足迹</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-header">
        <text class="menu-header-text">我的功能</text>
      </view>
      <view class="menu-grid">
        <view class="menu-item" @click="goPage('/pages/profile/mode-settings')">
          <view class="menu-icon-wrapper primary">
            <IconSvg name="target" :size="40" color="#FFFFFF" />
          </view>
          <text class="menu-text">骑行模式</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/trip/list')">
          <view class="menu-icon-wrapper warning">
            <IconSvg name="motorcycle" :size="40" color="#FFFFFF" />
          </view>
          <text class="menu-text">我的行程</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/diary/list')">
          <view class="menu-icon-wrapper info">
            <IconSvg name="notebook" :size="40" color="#FFFFFF" />
          </view>
          <text class="menu-text">我的日记</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/route/my')">
          <view class="menu-icon-wrapper success">
            <IconSvg name="map" :size="40" color="#FFFFFF" />
          </view>
          <text class="menu-text">我的路线</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/preparation/list')">
          <view class="menu-icon-wrapper purple">
            <IconSvg name="backpack" :size="40" color="#FFFFFF" />
          </view>
          <text class="menu-text">装备清单</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/favorites/index')">
          <view class="menu-icon-wrapper error">
            <IconSvg name="heart" :size="40" color="#FFFFFF" />
          </view>
          <text class="menu-text">我的收藏</text>
        </view>
      </view>
    </view>

    <!-- 其他设置 -->
    <view class="menu-section">
      <view class="menu-header">
        <text class="menu-header-text">其他</text>
      </view>
      <view class="menu-list">
        <view class="menu-item-row" @click="goPage('/pages/settings/index')">
          <view class="menu-item-left">
            <IconSvg name="settings" :size="36" color="#1A1A2E" />
            <text class="menu-item-text">设置</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item-row" @click="goPage('/pages/about/index')">
          <view class="menu-item-left">
            <IconSvg name="info" :size="36" color="#1A1A2E" />
            <text class="menu-item-text">关于</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item-row" @click="goPage('/pages/help/index')">
          <view class="menu-item-left">
            <IconSvg name="help" :size="36" color="#1A1A2E" />
            <text class="menu-item-text">帮助与反馈</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="userStore.isLoggedIn">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
    
    <!-- 底部占位 -->
    <view class="bottom-space"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const stats = ref({
  routes: 0,
  trips: 0,
  diaries: 0,
  followers: 0,
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goPage(url: string) {
  uni.navigateTo({ url })
}

function editProfile() {
  uni.navigateTo({ url: '/pages/profile/edit' })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #F2F2F7;
}

.profile-header {
  position: relative;
  height: 480rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-top: 100rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FF9500 100%);
}

.user-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 20rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.4);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48rpx;
  height: 48rpx;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  
  text {
    font-size: 24rpx;
  }
}

.nickname {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.bio {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16rpx;
  text-align: center;
  max-width: 400rpx;
}

.motorcycle-tag {
  background: rgba(255, 255, 255, 0.25);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  
  text {
    font-size: 24rpx;
    color: #FFFFFF;
    font-weight: 500;
  }
}

.login-prompt {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-avatar {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  
  text {
    font-size: 80rpx;
  }
}

.prompt-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.prompt-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 32rpx;
}

.login-btn {
  background: #FFFFFF;
  color: #FF6B35;
  border: none;
  padding: 20rpx 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  
  &::after {
    display: none;
  }
}

/* 统计 */
.stats-section {
  display: flex;
  background: #FFFFFF;
  padding: 32rpx 0;
  margin: -40rpx 32rpx 0;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #8E8E93;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #F2F2F7;
}

/* 菜单区块 */
.menu-section {
  margin: 32rpx;
}

.menu-header {
  padding: 0 8rpx;
  margin-bottom: 16rpx;
}

.menu-header-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #8E8E93;
}

.menu-grid {
  display: flex;
  flex-wrap: wrap;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 16rpx;
}

.menu-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.menu-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  
  &.primary { background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%); }
  &.warning { background: linear-gradient(135deg, #FF9500 0%, #FFB340 100%); }
  &.success { background: linear-gradient(135deg, #34C759 0%, #5DD97E 100%); }
  &.info { background: linear-gradient(135deg, #5AC8FA 0%, #8ED6FF 100%); }
  &.purple { background: linear-gradient(135deg, #AF52DE 0%, #C77DFF 100%); }
  &.error { background: linear-gradient(135deg, #FF3B30 0%, #FF6961 100%); }
}

.menu-icon {
  font-size: 40rpx;
}

.menu-text {
  font-size: 24rpx;
  color: #1A1A2E;
  font-weight: 500;
}

/* 列表菜单 */
.menu-list {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.menu-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F2F2F7;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #F8F8F8;
  }
}

.menu-item-left {
  display: flex;
  align-items: center;
}

.menu-item-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-item-text {
  font-size: 30rpx;
  color: #1A1A2E;
}

.menu-arrow {
  color: #C7C7CC;
  font-size: 36rpx;
}

/* 退出登录 */
.logout-section {
  padding: 0 32rpx;
}

.logout-btn {
  width: 100%;
  background: #FFFFFF;
  color: #FF3B30;
  border: none;
  padding: 28rpx;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 500;
  
  &::after {
    display: none;
  }
}

.bottom-space {
  height: 60rpx;
}
</style>
