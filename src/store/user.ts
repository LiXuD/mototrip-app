import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserModeSettings, UserMode } from '@/types'
import { userModeApi } from '@/services/api'
import { useRouteStore } from './route'
import { useTripStore } from './trip'
import { useDiaryStore } from './diary'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '')
  const userInfo = ref<User | null>(null)
  const userMode = ref<UserModeSettings | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  // 计算当前用户模式类型
  const currentMode = computed<UserMode | null>(() => {
    return userMode.value?.mode || null
  })

  // 判断是否为新手模式
  const isNewbie = computed(() => userMode.value?.mode === 'newbie')

  // 判断是否为老手模式
  const isExperienced = computed(() => userMode.value?.mode === 'experienced')

  // 判断是否为带人模式
  const isPassenger = computed(() => userMode.value?.mode === 'passenger')

  function setToken(newToken: string) {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }

  function setUserInfo(info: User) {
    userInfo.value = info
  }

  // 加载用户模式设置
  async function loadUserMode() {
    try {
      const modeData = await userModeApi.get()
      userMode.value = modeData
      return modeData
    } catch (error) {
      console.error('加载用户模式失败:', error)
      return null
    }
  }

  // 更新用户模式设置
  async function updateUserMode(data: Partial<UserModeSettings>) {
    try {
      const modeData = await userModeApi.update(data)
      userMode.value = modeData
      return modeData
    } catch (error) {
      console.error('更新用户模式失败:', error)
      throw error
    }
  }

  // 切换用户模式
  async function switchUserMode(mode: UserMode) {
    try {
      const modeData = await userModeApi.switchMode(mode)
      userMode.value = modeData
      return modeData
    } catch (error) {
      console.error('切换用户模式失败:', error)
      throw error
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    userMode.value = null

    useRouteStore().resetStore()
    useTripStore().resetStore()
    useDiaryStore().resetStore()

    uni.removeStorageSync('token')
  }

  return {
    token,
    userInfo,
    userMode,
    isLoggedIn,
    currentMode,
    isNewbie,
    isExperienced,
    isPassenger,
    setToken,
    setUserInfo,
    loadUserMode,
    updateUserMode,
    switchUserMode,
    logout,
  }
})
