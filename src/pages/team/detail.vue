<template>
  <view class="team-detail-page" v-if="team">
    <view class="cover">
      <image :src="team.coverImage || '/static/team-default.png'" mode="aspectFill" />
      <view class="status-badge" :class="team.status">{{ getStatusText(team.status) }}</view>
    </view>
    <view class="info-section">
      <text class="team-name">{{ team.name }}</text>
      <text class="team-dest"><IconSvg name="location" :size="28" color="#666" /> {{ team.destination || '未设置目的地' }}</text>
      <text class="team-time"><IconSvg name="clock" :size="28" color="#666" /> 出发：{{ formatDate(team.startTime) }}</text>
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
.cover { position: relative; height: 400rpx; image { width: 100%; height: 100%; } }
.status-badge { position: absolute; top: 20rpx; right: 20rpx; padding: 8rpx 20rpx; font-size: 24rpx; color: #fff; border-radius: 20rpx; &.open { background: #34C759; } &.full { background: #FF9500; } &.ongoing { background: #007AFF; } }
.info-section { background: #fff; padding: 30rpx; margin-bottom: 20rpx; }
.team-name { font-size: 36rpx; font-weight: bold; display: block; }
.team-dest, .team-time, .team-desc { font-size: 28rpx; color: #666; display: block; margin-top: 10rpx; }
.members-section { background: #fff; padding: 30rpx; }
.section-title { font-size: 30rpx; font-weight: bold; display: block; margin-bottom: 20rpx; }
.members-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.member-item { display: flex; align-items: center; width: 45%; padding: 16rpx; background: #f5f5f5; border-radius: 8rpx; }
.member-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; margin-right: 16rpx; }
.member-info { flex: 1; }
.member-name { font-size: 26rpx; font-weight: bold; display: block; }
.member-role { font-size: 22rpx; color: #666; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; padding: 20rpx; background: #fff; gap: 20rpx; }
.btn { flex: 1; padding: 20rpx; border-radius: 8rpx; background: #f5f5f5; text-align: center; }
.btn.primary { background: #007AFF; color: #fff; }
</style>
