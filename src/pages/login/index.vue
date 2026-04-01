<template>
  <view class="login-page">
    <view class="hero">
      <text class="hero-title">欢迎登录摩旅助手</text>
      <text class="hero-subtitle">同步路线、行程、日记与个人偏好。</text>
    </view>

    <view class="form-card">
      <view class="field">
        <text class="field-label">账号</text>
        <input v-model="form.username" class="field-input" placeholder="请输入用户名或手机号" />
      </view>
      <view class="field">
        <text class="field-label">密码</text>
        <input v-model="form.password" class="field-input" password placeholder="请输入密码" />
      </view>
      <button class="submit-btn" :loading="submitting" @click="handleSubmit">登录</button>
      <text class="hint">请输入已注册账号密码；登录成功后将返回个人中心。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '@/store'
import { authApi } from '@/services/api'
import type { User } from '@/types'

const userStore = useUserStore()
const submitting = ref(false)
const form = reactive({ username: '', password: '' })

async function handleSubmit() {
  if (!form.username || !form.password) {
    uni.showToast({ title: '请输入完整账号密码', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const result = await authApi.login({
      username: form.username,
      password: form.password,
    }) as { token: string; user: User }

    userStore.setToken(result.token)
    userStore.setUserInfo(result.user)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/profile/index' })
    }, 300)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0A0A1A 0%, #1A1020 35%);
  padding: 40rpx 24rpx;
}
.hero {
  padding: 120rpx 16rpx 40rpx;
}
.hero-title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}
.hero-subtitle {
  display: block;
  font-size: 28rpx;
  color: #8888AA;
  line-height: 1.7;
}
.form-card {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.3);
}
.field {
  margin-bottom: 24rpx;
}
.field-label {
  display: block;
  font-size: 26rpx;
  color: #8888AA;
  margin-bottom: 12rpx;
}
.field-input {
  width: 100%;
  height: 88rpx;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &::placeholder {
    color: #555577;
  }
}
.submit-btn {
  margin-top: 12rpx;
  background: linear-gradient(135deg, #FF6B35, #FF2D78);
  color: #FFFFFF;
  border-radius: 20rpx;
  font-size: 30rpx;
  letter-spacing: 1rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }
}
.hint {
  display: block;
  margin-top: 20rpx;
  color: #555577;
  font-size: 24rpx;
  text-align: center;
}
</style>
