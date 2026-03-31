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

// API 类型
import type {
  RouteListResponse, RouteDetailResponse, TripListResponse, TripDetailResponse, DiaryListResponse,
  WaypointListResponse, PostListResponse, PreparationListResponse, ReviewListResponse,
  OfflineMapListResponse, DangerZoneListResponse, DangerZoneNearbyResponse,
  NoParkingZoneListResponse, NoParkingZoneNearbyResponse, SuccessResponse,
  WeatherResponse, NightCheckResponse, WarningResponse
} from '@/types/api'
import type {
  Route, Trip, Diary, User, Waypoint, Post, Preparation, Review, OfflineMap,
  DangerZone, DangerZoneReport, NoParkingZone, NoParkingZoneReport, Weather
} from '@/types'

// API 方法
export const authApi = {
  login: (data: { username: string; password: string }) =>
    request<{ token: string; user: User }>({
      url: '/auth/login',
      method: 'POST',
      data,
    }),
  register: (data: { username: string; password: string; nickname: string }) =>
    request<{ token: string; user: User }>({
      url: '/auth/register',
      method: 'POST',
      data,
    }),
  getCurrentUser: () =>
    request<User>({
      url: '/auth/current',
    }),
  logout: () =>
    request<SuccessResponse>({
      url: '/auth/logout',
      method: 'POST',
    }),
}

export const userApi = {
  getProfile: (id: number) =>
    request<User>({
      url: `/users/${id}`,
    }),
  updateProfile: (data: Partial<User>) =>
    request<User>({
      url: '/users/profile',
      method: 'PUT',
      data,
    }),
}

export const routeApi = {
  list: (params?: { page?: number; pageSize?: number; keyword?: string; difficulty?: string; sort?: 'desc' | 'asc' }) =>
    request<RouteListResponse>({
      url: '/routes',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<RouteDetailResponse>({
      url: `/routes/${id}`,
    }),
  create: (data: Omit<Route, 'id' | 'createdAt' | 'updatedAt' | 'creator' | 'creatorId' | 'likes' | 'views'>) =>
    request<RouteDetailResponse>({
      url: '/routes',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<Omit<Route, 'id' | 'createdAt' | 'updatedAt' | 'creator' | 'creatorId' | 'likes' | 'views'>>) =>
    request<RouteDetailResponse>({
      url: `/routes/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/routes/${id}`,
      method: 'DELETE',
    }),
}

export const waypointApi = {
  list: (params?: { routeId?: number; tripId?: number; type?: string }) =>
    request<WaypointListResponse>({
      url: '/waypoints',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<Waypoint>({
      url: `/waypoints/${id}`,
    }),
  create: (data: Omit<Waypoint, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Waypoint>({
      url: '/waypoints',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<Waypoint>) =>
    request<Waypoint>({
      url: `/waypoints/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/waypoints/${id}`,
      method: 'DELETE',
    }),
}

export const tripApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    request<TripListResponse>({
      url: '/trips',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<TripDetailResponse>({
      url: `/trips/${id}`,
    }),
  create: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId' | 'route'>) =>
    request<TripDetailResponse>({
      url: '/trips',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId' | 'route'>>) =>
    request<TripDetailResponse>({
      url: `/trips/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/trips/${id}`,
      method: 'DELETE',
    }),
}

export const diaryApi = {
  list: (params?: { page?: number; pageSize?: number; tripId?: number; userId?: number; tag?: string }) =>
    request<DiaryListResponse>({
      url: '/diaries',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<Diary>({
      url: `/diaries/${id}`,
    }),
  create: (data: Omit<Diary, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId'>) =>
    request<Diary>({
      url: '/diaries',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<Omit<Diary, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId'>>) =>
    request<Diary>({
      url: `/diaries/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/diaries/${id}`,
      method: 'DELETE',
    }),
  like: (id: number) =>
    request<SuccessResponse>({
      url: `/diaries/${id}/like`,
      method: 'POST',
    }),
}

export const postApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request<PostListResponse>({
      url: '/posts',
      method: 'GET',
      data: params,
    }),
  create: (data: { content: string; images?: string[]; location?: { lat: number; lng: number } }) =>
    request<Post>({
      url: '/posts',
      method: 'POST',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/posts/${id}`,
      method: 'DELETE',
    }),
  like: (id: number) =>
    request<SuccessResponse>({
      url: `/posts/${id}/like`,
      method: 'POST',
    }),
}

export const preparationApi = {
  list: () =>
    request<PreparationListResponse>({
      url: '/preparations',
    }),
  create: (data: Omit<Preparation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'isPacked'>) =>
    request<Preparation>({
      url: '/preparations',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<Preparation>) =>
    request<Preparation>({
      url: `/preparations/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/preparations/${id}`,
      method: 'DELETE',
    }),
  togglePacked: (id: number) =>
    request<Preparation>({
      url: `/preparations/${id}/toggle`,
      method: 'POST',
    }),
}

export const weatherApi = {
  getCurrent: (location: string) =>
    request<WeatherResponse>({
      url: `/weather/current`,
      method: 'GET',
      data: { location },
    }),
}

export const reviewApi = {
  create: (data: { routeId: number; rating: number; content?: string }) =>
    request<Review>({
      url: '/reviews',
      method: 'POST',
      data,
    }),
  listByRoute: (routeId: number, params?: { page?: number; pageSize?: number }) =>
    request<ReviewListResponse>({
      url: `/reviews/route/${routeId}`,
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<Review>({
      url: `/reviews/${id}`,
    }),
  update: (id: number, data: { rating?: number; content?: string }) =>
    request<Review>({
      url: `/reviews/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/reviews/${id}`,
      method: 'DELETE',
    }),
}

export const mapApi = {
  list: () =>
    request<OfflineMapListResponse>({
      url: '/maps',
      method: 'GET',
    }),
  getDetail: (id: number) =>
    request<OfflineMap>({
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
    request<OfflineMap>({
      url: '/maps',
      method: 'POST',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
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
    request<DangerZoneListResponse>({
      url: '/danger-zones',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<DangerZone>({
      url: `/danger-zones/${id}`,
    }),
  getNearby: (lat: number, lng: number, radius?: number) =>
    request<DangerZoneNearbyResponse>({
      url: '/danger-zones/nearby',
      method: 'GET',
      data: { lat, lng, radius },
    }),
  getStatistics: () =>
    request<{ total: number; active: number; resolved: number; ignored: number }>({
      url: '/danger-zones/statistics',
    }),
  create: (data: DangerZoneReport) =>
    request<DangerZone>({
      url: '/danger-zones',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<DangerZoneReport>) =>
    request<DangerZone>({
      url: `/danger-zones/${id}`,
      method: 'PUT',
      data,
    }),
  resolve: (id: number) =>
    request<SuccessResponse>({
      url: `/danger-zones/${id}/resolve`,
      method: 'POST',
    }),
  ignore: (id: number) =>
    request<SuccessResponse>({
      url: `/danger-zones/${id}/ignore`,
      method: 'POST',
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/danger-zones/${id}`,
      method: 'DELETE',
    }),
}

// 禁停区域 API
export const noParkingZoneApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request<NoParkingZoneListResponse>({
      url: '/no-parking-zones',
      method: 'GET',
      data: params,
    }),
  getDetail: (id: number) =>
    request<NoParkingZone>({
      url: `/no-parking-zones/${id}`,
    }),
  getNearby: (lat: number, lng: number, radius?: number) =>
    request<NoParkingZoneNearbyResponse>({
      url: '/no-parking-zones/nearby',
      method: 'GET',
      data: { lat, lng, radius },
    }),
  create: (data: NoParkingZoneReport) =>
    request<NoParkingZone>({
      url: '/no-parking-zones',
      method: 'POST',
      data,
    }),
  update: (id: number, data: Partial<NoParkingZoneReport>) =>
    request<NoParkingZone>({
      url: `/no-parking-zones/${id}`,
      method: 'PUT',
      data,
    }),
  delete: (id: number) =>
    request<SuccessResponse>({
      url: `/no-parking-zones/${id}`,
      method: 'DELETE',
    }),
}

// 警告 API
export const warningApi = {
  checkNightRiding: (lat: number, lng: number) =>
    request<NightCheckResponse>({
      url: '/warnings/night-check',
      method: 'GET',
      data: { lat, lng },
    }),
  getWarnings: (lat: number, lng: number, radius?: number) =>
    request<WarningResponse>({
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
