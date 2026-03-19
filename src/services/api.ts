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
            uni.showToast({
              title: result.message || '请求失败',
              icon: 'none',
            })
            reject(new Error(result.message))
          }
        } else if (res.statusCode === 401) {
          // 防止重复跳转：检查是否已经在登录页
          const pages = uni.getCurrentPages()
          const currentPage = pages[pages.length - 1]
          const isLoginPage = currentPage?.route?.includes('login')
          
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
export const authApi = {
  login: (data: { username: string; password: string }) =>
    request<{ token: string; user: unknown }>({
      url: '/auth/login',
      method: 'POST',
      data,
    }),
  register: (data: { username: string; password: string; nickname: string }) =>
    request<{ token: string; user: unknown }>({
      url: '/auth/register',
      method: 'POST',
      data,
    }),
  getCurrentUser: () =>
    request<unknown>({
      url: '/auth/current',
    }),
  logout: () =>
    request<unknown>({
      url: '/auth/logout',
      method: 'POST',
    }),
}

export const userApi = {
  getProfile: (id: number) =>
    request<unknown>({
      url: `/users/${id}`,
    }),
  updateProfile: (data: unknown) =>
    request<unknown>({
      url: '/users/profile',
      method: 'PUT',
      data,
    }),
}

export const routeApi = {
  list: (params?: { page?: number; pageSize?: number; keyword?: string; difficulty?: string }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: '/routes',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/routes/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/routes',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/routes/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/routes/${id}`,
      method: 'DELETE',
    }),
}

export const waypointApi = {
  list: (params?: { routeId?: number; tripId?: number; type?: string }) =>
    request<unknown>({
      url: '/waypoints',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/waypoints/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/waypoints',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/waypoints/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/waypoints/${id}`,
      method: 'DELETE',
    }),
}

export const tripApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    request<unknown>({
      url: '/trips',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/trips/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/trips',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/trips/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/trips/${id}`,
      method: 'DELETE',
    }),
}

export const diaryApi = {
  list: (params?: { page?: number; pageSize?: number; tripId?: number; userId?: number }) =>
    request<unknown>({
      url: '/diaries',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/diaries/${id}`,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/diaries',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/diaries/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/diaries/${id}`,
      method: 'DELETE',
    }),
  like: (id: number) =>
    request<unknown>({
      url: `/diaries/${id}/like`,
      method: 'POST',
    }),
}

export const postApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request<unknown>({
      url: '/posts',
      method: 'GET',
      data: params,
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/posts',
      method: 'POST',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/posts/${id}`,
      method: 'DELETE',
    }),
  like: (id: number) =>
    request<unknown>({
      url: `/posts/${id}/like`,
      method: 'POST',
    }),
}

export const preparationApi = {
  list: () =>
    request<unknown>({
      url: '/preparations',
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/preparations',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/preparations/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/preparations/${id}`,
      method: 'DELETE',
    }),
  togglePacked: (id: number) =>
    request<unknown>({
      url: `/preparations/${id}/toggle`,
      method: 'POST',
    }),
}

export const weatherApi = {
  getCurrent: (location: string) =>
    request<unknown>({
      url: `/weather/current`,
      method: 'GET',
      data: { location },
    }),
}

export const reviewApi = {
  create: (data: { routeId: number; rating: number; content?: string }) =>
    request<unknown>({
      url: '/reviews',
      method: 'POST',
      data,
    }),
  listByRoute: (routeId: number, params?: { page?: number; pageSize?: number }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: `/reviews/route/${routeId}`,
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/reviews/${id}`,
    }),
  update: (id: number, data: { rating?: number; content?: string }) =>
    request<unknown>({
      url: `/reviews/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/reviews/${id}`,
      method: 'DELETE',
    }),
}

export const mapApi = {
  list: () =>
    request<unknown[]>({
      url: '/maps',
      method: 'GET',
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/maps/${id}`,
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
      url: '/maps',
      method: 'POST',
      data,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/maps/${id}`,
      method: 'DELETE',
    }),
  getTiles: (id: number) =>
    request<{ x: number; y: number; z: number; url: string }[]>({
      url: `/maps/${id}/tiles`,
      method: 'GET',
    }),
  startDownload: (id: number) =>
    request<{ message: string; mapId: number }>({
      url: `/maps/${id}/download`,
      method: 'POST',
    }),
}

// 危险路段 API
export const dangerZoneApi = {
  list: (params?: { page?: number; pageSize?: number; type?: string; severity?: string }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: '/danger-zones',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/danger-zones/${id}`,
    }),
  getNearby: (lat: number, lng: number, radius?: number) =>
    request<unknown[]>({
      url: '/danger-zones/nearby',
      method: 'GET',
      data: { lat, lng, radius },
    }),
  getStatistics: () =>
    request<unknown>({
      url: '/danger-zones/statistics',
    }),
  create: (data: unknown) =>
    request<unknown>({
      url: '/danger-zones',
      method: 'POST',
      data,
    }),
  update: (id: number, data: unknown) =>
    request<unknown>({
      url: `/danger-zones/${id}`,
      method: 'PUT',
      data,
    }),
  resolve: (id: number) =>
    request<unknown>({
      url: `/danger-zones/${id}/resolve`,
      method: 'POST',
    }),
  ignore: (id: number) =>
    request<unknown>({
      url: `/danger-zones/${id}/ignore`,
      method: 'POST',
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/danger-zones/${id}`,
      method: 'DELETE',
    }),
}

// 禁停区域 API
export const noParkingZoneApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request<{ list: unknown[]; total: number; page: number; pageSize: number; hasMore: boolean }>({
      url: '/no-parking-zones',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<unknown>({
      url: `/no-parking-zones/${id}`,
    }),
  getNearby: (lat: number, lng: number, radius?: number) =>
    request<unknown[]>({
      url: '/no-parking-zones/nearby',
      method: 'GET',
      data: { lat, lng, radius },
    }),
  create: (data: import('@/types').NoParkingZoneReport) =>
    request<unknown>({
      url: '/no-parking-zones',
      method: 'POST',
      data: data as unknown as Record<string, unknown>,
    }),
  update: (id: number, data: import('@/types').NoParkingZoneReport) =>
    request<unknown>({
      url: `/no-parking-zones/${id}`,
      method: 'PUT',
      data: data as unknown as Record<string, unknown>,
    }),
  delete: (id: number) =>
    request<unknown>({
      url: `/no-parking-zones/${id}`,
      method: 'DELETE',
    }),
}

// 警告 API
export const warningApi = {
  checkNightRiding: (lat: number, lng: number) =>
    request<unknown>({
      url: '/warnings/night-check',
      method: 'GET',
      data: { lat, lng },
    }),
  getWarnings: (lat: number, lng: number, radius?: number) =>
    request<unknown>({
      url: '/warnings',
      method: 'GET',
      data: { lat, lng, radius },
    }),
}

// 用户模式 API
export const userModeApi = {
  get: () =>
    request<import('@/types').UserModeSettings>({
      url: '/user-mode',
    }),
  update: (data: Partial<import('@/types').UserModeSettings>) =>
    request<import('@/types').UserModeSettings>({
      url: '/user-mode',
      method: 'PUT',
      data,
    }),
  switchMode: (mode: import('@/types').UserMode) =>
    request<import('@/types').UserModeSettings>({
      url: '/user-mode/switch',
      method: 'PUT',
      data: { mode },
    }),
  getCurrentMode: () =>
    request<{ mode: import('@/types').UserMode }>({
      url: '/user-mode/current',
    }),
}
