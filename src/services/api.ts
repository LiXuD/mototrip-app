// API 基础配置
import { API_URL } from '@/utils/env'

const BASE_URL = API_URL

// 请求封装
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  header?: Record<string, string>
}

interface RequestResult<T = unknown> {
  code: number
  message: string
  data: T
}

async function request<T>(options: RequestOptions): Promise<T> {
  const token = uni.getStorageSync('token')
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  }

  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data as unknown as UniApp.RequestOptions['data'],
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          const result = res.data as RequestResult<T>
          if (result.code === 200 || result.code === 0) {
            resolve(result.data)
          } else {
            // 业务错误，显示错误信息
            uni.showToast({
              title: result.message || '请求失败',
              icon: 'none',
            })
            reject(new Error(result.message))
          }
        } else if (res.statusCode === 401) {
          // 检查响应数据是否包含业务错误信息
          const result = res.data as RequestResult<T>
          if (result?.message) {
            // 业务错误（如用户名密码错误），显示错误信息
            uni.showToast({
              title: result.message,
              icon: 'none',
            })
            reject(new Error(result.message))
          } else {
            // 认证错误（如 token 过期）
            // 防止重复跳转：检查是否已经在登录页
            let isLoginPage = false
            try {
              // 检查 uni.getCurrentPages 是否存在
              if (typeof uni.getCurrentPages === 'function') {
                const pages = uni.getCurrentPages()
                const currentPage = pages[pages.length - 1]
                isLoginPage = currentPage?.route?.includes('login')
              }
            } catch (error) {
              console.warn('获取当前页面失败:', error)
            }
            
            if (!isLoginPage) {
              uni.removeStorageSync('token')
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
              })
              // 延迟跳转，避免连续触发
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/login/index' })
              }, 1500)
            }
            reject(new Error('未授权'))
          }
        } else {
          reject(new Error('请求失败'))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}

// API 方法
import type { LoginResponse, UserResponse } from '@/types'

export const authApi = {
  login: (data: { username: string; password: string }) =>
    request<LoginResponse>({
      url: '/api/auth/login',
      method: 'POST',
      data,
    }),
  register: (data: { username: string; password: string; nickname: string }) =>
    request<LoginResponse>({
      url: '/api/auth/register',
      method: 'POST',
      data,
    }),
  getCurrentUser: () =>
    request<UserResponse>({
      url: '/api/auth/current',
    }),
  logout: () =>
    request<unknown>({
      url: '/api/auth/logout',
      method: 'POST',
    }),
}

export const userApi = {
  getProfile: (id: number) =>
    request<unknown>({
      url: `/api/users/${id}`,
    }),
  updateProfile: (data: unknown) =>
    request<unknown>({
      url: '/api/users/profile',
      method: 'PUT',
      data,
    }),
}

export const routeApi = {
  list: (params?: { page?: number; pageSize?: number; keyword?: string; difficulty?: string; sort?: 'desc' | 'asc' }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: '/api/routes',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/routes/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/routes',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/api/routes/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/routes/${id}`,
      method: 'DELETE',
    }),
}

export const waypointApi = {
  list: (params?: { routeId?: number; tripId?: number; type?: string }) =>
    request<unknown>({
      url: '/api/waypoints',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/waypoints/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/waypoints',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/api/waypoints/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/waypoints/${id}`,
      method: 'DELETE',
    }),
}

export const tripApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    request<unknown>({
      url: '/api/trips',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/trips/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/trips',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/api/trips/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/trips/${id}`,
      method: 'DELETE',
    }),
}

export const diaryApi = {
  list: (params?: { page?: number; pageSize?: number; tripId?: number; userId?: number; tag?: string }) =>
    request<unknown>({
      url: '/api/diaries',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/diaries/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/diaries',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/api/diaries/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/diaries/${id}`,
      method: 'DELETE',
    }),
  like: (id: number) =>
    request<unknown>({
      url: `/api/diaries/${id}/like`,
      method: 'POST',
    }),
}

export const postApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request<unknown>({
      url: '/api/posts',
      method: 'GET',
      data: params,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/posts',
      method: 'POST',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/posts/${id}`,
      method: 'DELETE',
    }),
  like: (id: number) =>
    request<unknown>({
      url: `/api/posts/${id}/like`,
      method: 'POST',
    }),
}

export const preparationApi = {
  list: () =>
    request<unknown>({
      url: '/api/preparations',
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/preparations',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/api/preparations/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/preparations/${id}`,
      method: 'DELETE',
    }),
  togglePacked: (id: number) =>
    request<unknown>({
      url: `/api/preparations/${id}/toggle`,
      method: 'POST',
    }),
}

export const weatherApi = {
  getCurrent: (location: string) =>
    request<unknown>({
      url: `/api/weather/current`,
      method: 'GET',
      data: { location },
    }),
}

export const reviewApi = {
  create: (data: { routeId: number; rating: number; content?: string }) =>
    request<unknown>({
      url: '/api/reviews',
      method: 'POST',
      data,
    }),
  listByRoute: (routeId: number, params?: { page?: number; pageSize?: number }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: `/api/reviews/route/${routeId}`,
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/reviews/${id}`,
    }),
  update: (id: number, data: { rating?: number; content?: string }) =>
    request<unknown>({
      url: `/api/reviews/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/reviews/${id}`,
      method: 'DELETE',
    }),
}

export const mapApi = {
  list: () =>
    request<unknown[]>({
      url: '/api/maps',
      method: 'GET',
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/maps/${id}`,
    }),
  create: (data: {
    name: string;
    description?: string;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    minZoom?: number;
    maxZoom?: number;
    mapProvider?: string;
  }) =>
    request<unknown>({
      url: '/api/maps',
      method: 'POST',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/maps/${id}`,
      method: 'DELETE',
    }),
  getTiles: (id: number) =>
    request<{ x: number; y: number; z: number; url: string }[]>({
      url: `/api/maps/${id}/tiles`,
      method: 'GET',
    }),
  startDownload: (id: number) =>
    request<{ message: string; mapId: number }>({
      url: `/api/maps/${id}/download`,
      method: 'POST',
    }),
}

// 危险路段 API
export const dangerZoneApi = {
  list: (params?: { page?: number; pageSize?: number; type?: string; severity?: string }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: '/api/danger-zones',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/danger-zones/${id}`,
    }),
  getNearby: (lat: number, lng: number, radius?: number) =>
    request<unknown[]>({
      url: '/api/danger-zones/nearby',
      method: 'GET',
      data: { lat, lng, radius },
    }),
  getStatistics: () =>
    request<unknown>({
      url: '/api/danger-zones/statistics',
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/api/danger-zones',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/api/danger-zones/${id}`,
      method: 'PUT',
      data,
    }),
  resolve: (id: number) =>
    request<unknown>({
      url: `/api/danger-zones/${id}/resolve`,
      method: 'POST',
    }),
  ignore: (id: number) =>
    request<unknown>({
      url: `/api/danger-zones/${id}/ignore`,
      method: 'POST',
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/danger-zones/${id}`,
      method: 'DELETE',
    }),
}

// 禁停区域 API
export const noParkingZoneApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: '/api/no-parking-zones',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/api/no-parking-zones/${id}`,
    }),
  getNearby: (lat: number, lng: number, radius?: number) =>
    request<unknown[]>({
      url: '/api/no-parking-zones/nearby',
      method: 'GET',
      data: { lat, lng, radius },
    }),
  create: (data: import('@/types').NoParkingZoneReport) =>
    request<unknown>({
      url: '/api/no-parking-zones',
      method: 'POST',
      data: data as unknown as Record<string, unknown>,
    }),
  update: (id: number, data: import('@/types').NoParkingZoneReport) =>
    request<unknown>({
      url: `/api/no-parking-zones/${id}`,
      method: 'PUT',
      data: data as unknown as Record<string, unknown>,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/api/no-parking-zones/${id}`,
      method: 'DELETE',
    }),
}

// 警告 API
export const warningApi = {
  checkNightRiding: (lat: number, lng: number) =>
    request<unknown>({
      url: '/api/warnings/night-check',
      method: 'GET',
      data: { lat, lng },
    }),
  getWarnings: (lat: number, lng: number, radius?: number) =>
    request<unknown>({
      url: '/api/warnings',
      method: 'GET',
      data: { lat, lng, radius },
    }),
}

// 用户模式 API
export const userModeApi = {
  get: () =>
    request<import('@/types').UserModeSettings>({
      url: '/api/user-mode',
    }),
  update: (data: Partial<import('@/types').UserModeSettings>) =>
    request<import('@/types').UserModeSettings>({
      url: '/api/user-mode',
      method: 'PUT',
      data,
    }),
  switchMode: (mode: import('@/types').UserMode) =>
    request<import('@/types').UserModeSettings>({
      url: '/api/user-mode/switch',
      method: 'PUT',
      data: { mode },
    }),
  getCurrentMode: () =>
    request<{ mode: import('@/types').UserMode }>({
      url: '/api/user-mode/current',
    }),
}
