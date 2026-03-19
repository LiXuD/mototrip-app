// 用户相关类型
export interface User {
  id: number
  username: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  bio?: string
  motorcycle?: string
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  nickname: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: User
}

// 路线相关类型
export interface Route {
  id: number
  name: string
  description?: string
  coverImage?: string
  distance: number
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  startPoint: GeoPoint
  endPoint: GeoPoint
  waypoints: Waypoint[]
  creatorId: number
  creator?: User
  isPublic: boolean
  likes: number
  views: number
  createdAt: string
  updatedAt: string
}

export interface RouteListParams {
  page?: number
  pageSize?: number
  difficulty?: string
  keyword?: string
}

// 途点相关类型
export interface Waypoint {
  id: number
  name: string
  description?: string
  type: 'scenic' | 'restaurant' | 'hotel' | 'gas' | 'repair' | 'other'
  location: GeoPoint
  images?: string[]
  rating?: number
  phone?: string
  openingHours?: string
  routeId?: number
  tripId?: number
  createdAt: string
  updatedAt: string
}

// 行程相关类型
export interface Trip {
  id: number
  name: string
  description?: string
  coverImage?: string
  startDate: string
  endDate?: string
  status: 'planning' | 'ongoing' | 'completed'
  routeId?: number
  route?: Route
  waypoints: Waypoint[]
  totalDistance: number
  notes?: string
  userId: number
  user?: User
  createdAt: string
  updatedAt: string
}

export interface TripListParams {
  page?: number
  pageSize?: number
  status?: string
}

// 日记相关类型
export interface Diary {
  id: number
  title: string
  content: string
  images?: string[]
  location?: GeoPoint
  locationName?: string
  weather?: string
  temperature?: number
  mood?: 'happy' | 'excited' | 'calm' | 'tired' | 'neutral'
  tripId?: number
  trip?: Trip
  userId: number
  user?: User
  likes: number
  comments: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

export interface DiaryListParams {
  page?: number
  pageSize?: number
  tripId?: number
  userId?: number
}

// 社交相关类型
export interface Post {
  id: number
  content: string
  images?: string[]
  location?: GeoPoint
  userId: number
  user?: User
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  content: string
  postId: number
  userId: number
  user?: User
  parentId?: number
  replies?: Comment[]
  likes: number
  createdAt: string
}

// 整备相关类型
export interface Preparation {
  id: number
  name: string
  category: 'tool' | 'safety' | 'clothing' | 'electronics' | 'documents' | 'other'
  description?: string
  isEssential: boolean
  isPacked: boolean
  quantity?: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface PreparationChecklist {
  category: string
  items: Preparation[]
}

// 通用类型
export interface GeoPoint {
  lat: number
  lng: number
  name?: string
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 天气相关
export interface Weather {
  location: string
  temp: number
  weather: string
  wind: string
  humidity: number
  updateTime: string
}

// 评论相关
export interface Review {
  id: number
  content: string
  rating: number
  userId: number
  user?: User
  routeId?: number
  tripId?: number
  createdAt: string
  updatedAt: string
}

// 离线地图相关
export interface OfflineMap {
  id: number
  name: string
  description?: string
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
  minZoom: number
  maxZoom: number
  mapProvider: string
  tileCount: number
  downloadedCount: number
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  downloadProgress: number
  filePath?: string
  fileSize?: string
  creatorId: number
  createdAt: string
  updatedAt: string
}

export interface OfflineMapTile {
  x: number
  y: number
  z: number
  url: string
}

// 危险路段相关
export type DangerType = 'landslide' | 'falling_rocks' | 'steep_slope' | 'sharp_turn' | 'water_side' | 'cliff_side' | 'ice_snow' | 'flood' | 'construction' | 'other'
export type DangerSeverity = 'light' | 'medium' | 'severe'
export type DangerStatus = 'active' | 'resolved' | 'ignored'

// 带有距离信息的危险路段（用于附近查询结果）
export interface DangerZoneWithDistance extends DangerZone {
  distance: number
}

// 危险路段（基础）
export interface DangerZone {
  id: number
  name: string
  description?: string
  location: GeoPoint
  radius: number
  type: DangerType
  severity: DangerSeverity
  status: DangerStatus
  images?: string[]
  reporterId?: number
  reporter?: User
  createdAt: string
  updatedAt: string
  // 距离（可选，用于附近查询结果）
  distance?: number
}

export interface DangerZoneListParams {
  page?: number
  pageSize?: number
  type?: string
  severity?: string
}

// 禁停区域相关
export interface NoParkingZone {
  id: number
  name: string
  description?: string
  location: GeoPoint
  radius: number
  reason?: string
  startTime?: string
  endTime?: string
  status: 'active' | 'expired' | 'removed'
  reporterId?: number
  reporter?: User
  createdAt: string
  updatedAt: string
  // 距离（可选，用于附近查询结果）
  distance?: number
}

// 带有距离信息的禁停区域（用于附近查询结果）
export interface NoParkingZoneWithDistance extends NoParkingZone {
  distance: number
}

// 夜间警告相关
export interface NightWarning {
  isNight: boolean
  sunrise: string
  sunset: string
  message: string
}

export interface DangerWarning {
  id?: number
  type: string
  name: string
  severity: DangerSeverity
  distance: number
  location: GeoPoint
}

export interface NoParkingWarning {
  id?: number
  name: string
  distance: number
  reason?: string
  location: GeoPoint
}

export interface WarningResult {
  nightWarning: NightWarning
  dangerWarnings: DangerWarning[]
  noParkingWarnings: NoParkingWarning[]
  hasWarning: boolean
}

// 危险路段上报
export interface DangerZoneReport {
  name: string
  description?: string
  location: GeoPoint
  radius?: number
  type: DangerType
  severity: DangerSeverity
  images?: string[]
}

// 禁停区域上报
export interface NoParkingZoneReport {
  name: string
  description?: string
  location: GeoPoint
  radius?: number
  reason?: string
  startTime?: string
  endTime?: string
}

// ============ 社交模块类型 ============

// 组队
export interface Team {
  id: number
  name: string
  description?: string
  destination?: string
  startTime?: string
  endTime?: string
  maxMembers: number
  status: 'open' | 'full' | 'completed' | 'cancelled'
  coverImage?: string
  latitude?: number
  longitude?: number
  creatorId: number
  creator?: User
  memberCount?: number
  members?: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: number
  teamId: number
  userId: number
  user?: User
  role: 'member' | 'leader'
  status: 'pending' | 'approved' | 'rejected'
  joinedAt: string
}

export interface TeamListResponse {
  list: Team[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 足迹
export interface Footprint {
  id: number
  userId: number
  latitude: number
  longitude: number
  locationName?: string
  province?: string
  city?: string
  district?: string
  image?: string
  note?: string
  visitCount: number
  distance?: number
  visitedAt: string
}

export interface FootprintStats {
  totalFootprints: number
  provincesCount: number
  citiesCount: number
  totalDistance: number
}

export interface FootprintAchievement {
  id: number
  userId: number
  name: string
  description?: string
  icon?: string
  targetCount: number
  currentCount: number
  unlocked: boolean
  unlockedAt?: string
  createdAt: string
}

// 位置共享
export interface LocationShare {
  id: number
  ownerId: number
  viewerId: number
  owner?: User
  viewer?: User
  isActive: boolean
  currentLatitude?: number
  currentLongitude?: number
  lastUpdatedAt?: string
  updateCount: number
  createdAt: string
  updatedAt: string
}

// 分享
export interface TripShare {
  id: number
  userId: number
  tripId?: number
  title?: string
  summary?: string
  coverImage?: string
  totalDistance: number
  duration: number
  waypointCount: number
  routePoints?: { lat: number; lng: number }[]
  posterUrl?: string
  shared: boolean
  sharedAt?: string
  createdAt: string
}

// ============ 用户模式相关类型 ============

/**
 * 用户模式类型
 * - newbie: 新手模式
 * - experienced: 老手模式  
 * - passenger: 带人模式
 */
export type UserMode = 'newbie' | 'experienced' | 'passenger'

/**
 * 用户模式设置
 */
export interface UserModeSettings {
  id: number
  userId: number
  mode: UserMode
  maxRideDistance: number
  maxSpeed: number
  enableDistanceReminder: boolean
  enableSpeedReminder: boolean
  enableDangerWarning: boolean
  enableSimplifiedUI: boolean
  enableComfortMode: boolean
  enableProfessionalFeatures: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 用户模式信息（用于界面展示）
 */
export interface UserModeInfo {
  mode: UserMode
  title: string
  description: string
  features: string[]
  icon: string
}

// API 响应类型
export interface ApiListResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
