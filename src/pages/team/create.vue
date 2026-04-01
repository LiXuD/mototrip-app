<template>
  <view class="create-team-page">
    <view class="form">
      <view class="form-item">
        <text class="label">组队名称 *</text>
        <input class="input" v-model="form.name" placeholder="请输入组队名称" />
      </view>

      <view class="form-item">
        <text class="label">目的地 *</text>
        <input class="input" v-model="form.destination" placeholder="请输入目的地" />
      </view>

      <view class="form-item">
        <text class="label">出发时间</text>
        <picker mode="date" @change="onDateChange">
          <view class="picker">
            {{ form.startTime || '请选择出发日期' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">最大人数</text>
        <picker mode="selector" :range="memberOptions" @change="onMaxMembersChange">
          <view class="picker">
            {{ form.maxMembers }}人
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">描述</text>
        <textarea class="textarea" v-model="form.description" placeholder="请输入描述" />
      </view>

      <view class="form-item">
        <text class="label">封面图片</text>
        <view class="cover-upload" @click="chooseImage">
          <image v-if="form.coverImage" :src="form.coverImage" mode="aspectFill" />
          <text v-else>+ 添加封面</text>
        </view>
      </view>

      <button class="submit-btn" @click="submit" :disabled="submitting">
        {{ submitting ? '创建中...' : '创建组队' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  name: '',
  destination: '',
  startTime: '',
  maxMembers: 10,
  description: '',
  coverImage: '',
})

const submitting = ref(false)
const memberOptions = [2, 3, 4, 5, 6, 7, 8, 10, 15, 20]

function onDateChange(e: any) {
  form.startTime = e.detail.value
}

function onMaxMembersChange(e: any) {
  form.maxMembers = memberOptions[e.detail.value]
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // TODO: 上传图片
      form.coverImage = res.tempFilePaths[0]
    },
  })
}

async function submit() {
  if (!form.name || !form.destination) {
    uni.showToast({ title: '请填写必填项', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await uni.request({
      url: '/api/teams',
      method: 'POST',
      data: form,
    })
    uni.showToast({ title: '创建成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    uni.showToast({ title: '创建失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-team-page {
  min-height: 100vh;
  background: #0A0A1A;
  padding: 20rpx;
}

.form {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 24rpx;
  padding: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.input, .textarea {
  width: 100%;
  padding: 20rpx;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;

  &::placeholder {
    color: #555577;
  }

  &:focus {
    border-color: #00D4FF;
    box-shadow: 0 0 16rpx rgba(0, 212, 255, 0.3);
  }
}

.textarea {
  height: 160rpx;
}

.picker {
  padding: 20rpx;
  background: rgba(28, 28, 54, 0.8);
  border: 1rpx solid rgba(42, 42, 74, 0.8);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.cover-upload {
  width: 200rpx;
  height: 200rpx;
  background: rgba(28, 28, 54, 0.8);
  border: 2rpx dashed rgba(42, 42, 74, 0.8);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #555577;
  transition: all 0.3s ease;

  &:active {
    border-color: #00D4FF;
    box-shadow: 0 0 16rpx rgba(0, 212, 255, 0.2);
  }

  image {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
  }
}

.submit-btn {
  margin-top: 40rpx;
  background: linear-gradient(135deg, #00D4FF, #7B2FFF);
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }

  &::after {
    display: none;
  }

  &[disabled] {
    opacity: 0.5;
  }
}
</style>
