<template>
  <view class="team-detail-page" v-if="team">
    <view class="cover">
      <image :src="team.coverImage || '/static/team-default.png'" mode="aspectFill" />
      <view class="status-badge" :class="team.status">{{ getStatusText(team.status) }}</view>
    </view>
    <view class="info-section">
      <text class="team-name">{{ team.name }}</text>
      <text class="team-dest">📍 {{ team.destination || '未设置目的地' }}</text>
      <text class="team-time">🕐 出发：{{ formatDate(team.startTime) }}</text>
      <text class="team-desc" v-if="team.description">{{ team.description }}</text>
    </view>
    <view class="members-section">
      <text class="section-title">成员 ({{ members.length }}/{{ team.maxMembers }})</text>
      <view class="members-list">
        <view class="member-item" v-for="member in members" :key="member.id">
          <image class="member-avatar" :src="member.user?.avatar || '/static/avatar.png'" />
          <view class="member-info">
            <text class="member-name">{{ member.user?.nickname }}</text>
            <text class="member-role">{{ member.role === 'leader' ? '领队' : '成员' }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="bottom-bar">
      <button v-if="isCreator" class="btn" @click="goShare">邀请成员</button>
      <button v-else-if="!isMember" class="btn primary" @click="joinTeam">申请加入</button>
      <button v-else-if="!isLeader" class="btn" @click="leaveTeam">退出组队</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const team = ref<any>(null)
const members = ref<any[]>([])
const teamId = ref(0)

const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.id)
const isCreator = computed(() => team.value?.creatorId === currentUserId.value)
const isMember = computed(() => members.value.some((m: any) => m.user?.id === currentUserId.value))
const isLeader = computed(() => members.value.some((m: any) => m.user?.id === currentUserId.value && m.role === 'leader'))

onLoad((options: any) => { teamId.value = options.id; fetchDetail() })

async function fetchDetail() {
  const res: any = await uni.request({ url: `/api/teams/${teamId.value}` })
  if (res.data) {
    team.value = res.data
    members.value = res.data.members || []
  }
}

async function joinTeam() {
  await uni.request({ url: `/api/teams/${teamId.value}/join`, method: 'POST' })
  uni.showToast({ title: '申请已提交' })
  fetchDetail()
}

async function leaveTeam() {
  await uni.request({ url: `/api/teams/${teamId.value}/leave`, method: 'POST' })
  uni.showToast({ title: '已退出' })
  uni.navigateBack()
}

function goShare() { uni.showToast({ title: '分享功能开发中' }) }
function getStatusText(status: string) { const map: any = { open: '可加入', full: '已满员', ongoing: '进行中', completed: '已完成', cancelled: '已取消' }; return map[status] || status }
function formatDate(dateStr?: string) { if (!dateStr) return '待定'; const date = new Date(dateStr); return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` }
</script>

<style lang="scss" scoped>
.cover {
  position: relative;
  height: 400rpx;

  image {
    width: 100%;
    height: 100%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, #0A0A1A, transparent);
    pointer-events: none;
  }
}

.status-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #FFFFFF;
  border-radius: 20rpx;
  z-index: 1;

  &.open {
    background: rgba(0, 255, 136, 0.2);
    color: #00FF88;
    border: 1rpx solid rgba(0, 255, 136, 0.4);
    box-shadow: 0 0 12rpx rgba(0, 255, 136, 0.3);
  }
  &.full {
    background: rgba(255, 214, 0, 0.2);
    color: #FFD600;
    border: 1rpx solid rgba(255, 214, 0, 0.4);
    box-shadow: 0 0 12rpx rgba(255, 214, 0, 0.3);
  }
  &.ongoing {
    background: rgba(0, 212, 255, 0.2);
    color: #00D4FF;
    border: 1rpx solid rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 12rpx rgba(0, 212, 255, 0.3);
  }
  &.completed {
    background: rgba(58, 58, 90, 0.6);
    color: #8888AA;
    border: 1rpx solid rgba(42, 42, 74, 0.6);
  }
}

.info-section {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  padding: 30rpx;
  margin: 24rpx;
  border-radius: 24rpx;
}

.team-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
  letter-spacing: 2rpx;
}

.team-dest, .team-time, .team-desc {
  font-size: 28rpx;
  color: #8888AA;
  display: block;
  margin-top: 10rpx;
}

.members-section {
  background: rgba(28, 28, 54, 0.7);
  backdrop-filter: blur(16px);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  padding: 30rpx;
  margin: 0 24rpx;
  border-radius: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 20rpx;
  letter-spacing: 1rpx;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.member-item {
  display: flex;
  align-items: center;
  width: 45%;
  padding: 16rpx;
  background: rgba(42, 42, 74, 0.3);
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.member-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 2rpx solid rgba(0, 212, 255, 0.3);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
}

.member-role {
  font-size: 22rpx;
  color: #8888AA;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: rgba(28, 28, 54, 0.9);
  backdrop-filter: blur(16px);
  border-top: 1rpx solid rgba(42, 42, 74, 0.6);
  gap: 20rpx;
}

.btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  background: rgba(42, 42, 74, 0.4);
  color: #FFFFFF;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  border: 1rpx solid rgba(42, 42, 74, 0.6);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
  }

  &::after {
    display: none;
  }

  &.primary {
    background: linear-gradient(135deg, #00D4FF, #7B2FFF);
    border-color: transparent;
    box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.4);
    color: #FFFFFF;
  }
}
</style>
