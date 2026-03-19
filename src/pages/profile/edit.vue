<template>
  <scroll-view class="edit-page" scroll-y>
    <view class="card">
      <text class="title">编辑资料</text>
      <view class="field"><text class="label">昵称</text><input v-model="form.nickname" class="input" /></view>
      <view class="field"><text class="label">个性签名</text><textarea v-model="form.bio" class="textarea" /></view>
      <view class="field"><text class="label">座驾</text><input v-model="form.motorcycle" class="input" placeholder="例如：DL250 / GSX-S750" /></view>
      <view class="field"><text class="label">手机号</text><input v-model="form.phone" class="input" placeholder="选填" /></view>
      <button class="submit-btn" :loading="submitting" @click="save">保存资料</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '@/store'
import { userApi } from '@/services/api'

const userStore = useUserStore()
const submitting = ref(false)
const form = reactive({
  nickname: userStore.userInfo?.nickname || '骑士',
  bio: userStore.userInfo?.bio || '',
  motorcycle: userStore.userInfo?.motorcycle || '',
  phone: userStore.userInfo?.phone || '',
})

async function save() {
  if (!userStore.userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      nickname: form.nickname,
      bio: form.bio,
      motorcycle: form.motorcycle,
      phone: form.phone,
    }

    const result = await userApi.updateProfile(payload) as typeof userStore.userInfo.value
    userStore.setUserInfo({
      ...userStore.userInfo,
      ...payload,
      ...(result || {}),
      updatedAt: new Date().toISOString(),
    })

    uni.showToast({ title: '资料已更新', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 300)
  } catch (error) {
    console.error('更新资料失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-page { min-height: 100vh; background: #f2f2f7; }
.card { margin: 24rpx; background: #fff; border-radius: 24rpx; padding: 28rpx; }
.title { display: block; font-size: 40rpx; font-weight: 700; color: #1a1a2e; margin-bottom: 24rpx; }
.field { margin-bottom: 24rpx; }
.label { display: block; font-size: 26rpx; color: #666; margin-bottom: 10rpx; }
.input,.textarea { width: 100%; box-sizing: border-box; background: #f7f8fa; border-radius: 18rpx; padding: 22rpx 20rpx; font-size: 28rpx; }
.textarea { min-height: 220rpx; }
.submit-btn { background: #ff6b35; color: #fff; border-radius: 20rpx; font-size: 30rpx; }
</style>
